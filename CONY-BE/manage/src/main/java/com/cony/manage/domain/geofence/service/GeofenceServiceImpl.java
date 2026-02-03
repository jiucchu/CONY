package com.cony.manage.domain.geofence.service;

import com.cony.manage.domain.geofence.dto.GeofenceDto;
import com.cony.manage.domain.geofence.dto.GeofenceDto.InternalStoreData;
import com.cony.manage.domain.geofence.dto.GeofenceDto.MapPoint;
import com.cony.manage.domain.gifticon.enums.GifticonStatus;
import com.cony.manage.domain.gifticon.repository.GifticonRepository;
import com.cony.manage.domain.user.service.FcmNotificationService;
import com.cony.manage.global.util.RedisUtilService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.geo.GeoResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.geo.GeoResults;
import org.springframework.data.redis.connection.RedisGeoCommands;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeofenceServiceImpl implements GeofenceService {
    private final RedisUtilService redisUtilService;
    private final FcmNotificationService fcmNotificationService;
    private final GifticonRepository gifticonRepository;

    // --- Redis Keys ---
    private static final String GEO_KEY = "stores:geo"; // 좌표 데이터 (Sorted Set)
    private static final String INFO_KEY_PREFIX = "stores:info:"; // 상세 정보 (Hash)
    private static final String COOLDOWN_KEY_PREFIX = "geofence:cooldown:"; // 쿨다운 키 (Value: "1", TTL: 12h)

    // --- Geofence Settings ---
    private static final int MACRO_REFRESH_RADIUS = 2000; // 2km: 재요청 기준 반경 (Client용)
    private static final int SEARCH_RADIUS_BUFFER = 2500; // 2.5km: 실제 DB 검색 반경 (여유분)

    private static final int MICRO_STORE_RADIUS = 100; // 100m: 개별 매장 알림 반경
    private static final int MICRO_CLUSTER_RADIUS = 300; // 300m: 클러스터(묶음) 알림 반경

    // --- Optimization Settings ---
    private static final int ANDROID_GEOFENCE_LIMIT = 50; // 안드로이드 제한 고려 (안전하게 50개)
    private static final int CLUSTER_DISTANCE_THRESHOLD = 200;// 200m 내 매장들은 하나로 뭉침

    @Override
    public GeofenceDto.Response getNearbyStores(Long userId, GeofenceDto.Request request) {

        // 1. [Redis GEO] 사용자 위치 기준 N미터 반경 내 매장 ID 스캔
        // -> GEORADIUS 명령어를 사용하여 O(N+log(M)) 속도로 매우 빠르게 조회
        GeoResults<RedisGeoCommands.GeoLocation<Object>> radiusResults = redisUtilService.getGeoRadius(
                GEO_KEY,
                request.getLat(),
                request.getLon(),
                SEARCH_RADIUS_BUFFER);

        // 검색 결과가 없으면 빈 리스트 반환
        if (radiusResults == null || radiusResults.getContent().isEmpty()) {
            return buildResponse(request, Collections.emptyList());
        }

        // 2. [Data Processing] 조회된 GeoResult를 내부 객체로 변환
        List<GeoResultData> geoDataList = radiusResults.getContent().stream()
                .map(geoResult -> new GeoResultData(
                        geoResult.getContent().getName().toString(), // Store ID
                        geoResult.getDistance().getValue() // 거리 (m)
                )).toList();

        // 3. [Redis Pipeline] 매장 상세 정보(Hash) 일괄 조회
        // -> 수십 개의 HGETALL 명령을 네트워크 1회 왕복으로 처리하여 성능 극대화
        List<InternalStoreData> validStores = fetchAndFilterStores(geoDataList, request.getBrandIds());

        // 4. [Optimization] 클러스터링 및 개수 제한 (Android 제약 해결)
        // -> 너무 많은 매장을 줄여서 "최정예 리스트"로 만듦
        List<MapPoint> optimizedPoints = optimizePoints(validStores);

        // [Cooldown Filtering] 이미 알림을 받은 매장/클러스터는 제외
        if (userId != null) {
            optimizedPoints.removeIf(point -> isCooldown(userId, point.getId()));
        }

        // 5. 최종 응답 생성
        return buildResponse(request, optimizedPoints);
    }

    /**
     * Redis Pipeline을 이용해 상세 정보를 가져오고, 사용자가 가진 브랜드만 필터링합니다.
     */
    private List<InternalStoreData> fetchAndFilterStores(List<GeoResultData> geoDataList, List<Long> userBrandIds) {
        // 빠른 검색을 위해 List -> Set 변환
        Set<Long> userBrandSet = (userBrandIds == null) ? new HashSet<>() : new HashSet<>(userBrandIds);
        List<InternalStoreData> result = new ArrayList<>();

        // Pipeline 실행
        List<Object> pipelineResults = redisUtilService.executePipeline((RedisCallback<Object>) connection -> {
            // 직렬화 도구는 Util을 통해 가져오거나, RedisSerializer.string() 사용 가능
            RedisSerializer<String> serializer = redisUtilService.getTemplate().getStringSerializer();

            for (GeoResultData data : geoDataList) {
                String key = INFO_KEY_PREFIX + data.storeId;
                // HGETALL
                connection.hashCommands().hGetAll(serializer.serialize(key));
            }
            return null;
        });

        // Pipeline 결과 처리
        for (int i = 0; i < pipelineResults.size(); i++) {
            @SuppressWarnings("unchecked")
            Map<String, String> storeInfo = (Map<String, String>) pipelineResults.get(i);

            if (storeInfo == null || storeInfo.isEmpty())
                continue;

            try {
                Integer brandId = Integer.parseInt(storeInfo.get("brandId"));

                // [핵심 필터] 사용자가 보유한 기프티콘 브랜드인지 확인
                if (userBrandSet.contains(brandId) || userBrandSet.isEmpty()) {
                    GeoResultData geoData = geoDataList.get(i); // 순서가 보장되므로 인덱스로 매칭

                    result.add(InternalStoreData.builder()
                            .storeId(Long.parseLong(geoData.storeId))
                            .storeName(storeInfo.get("name"))
                            .brandId(brandId)
                            .lat(Double.parseDouble(storeInfo.get("lat")))
                            .lon(Double.parseDouble(storeInfo.get("lon")))
                            .distance(geoData.distance)
                            .build());
                }
            } catch (NumberFormatException e) {
                log.warn("Invalid data in Redis for store index {}", i);
            }
        }

        // 사용자로부터 가까운 순서대로 정렬 (우선순위 1순위: 거리)
        // (필요하다면 유효기간 임박 브랜드 등을 우선순위로 두는 로직 추가 가능)
        result.sort(Comparator.comparingDouble(InternalStoreData::getDistance));

        return result;
    }

    /**
     * [알고리즘] 그리디 클러스터링 (Greedy Clustering)
     * - 안드로이드 지오펜스 제한(약 100개, 안전하게 50개)을 맞추기 위해
     * - 가까운 매장들을 하나의 'CLUSTER'로 묶어줍니다.
     */
    private List<MapPoint> optimizePoints(List<InternalStoreData> stores) {
        List<MapPoint> finalPoints = new ArrayList<>();
        // 처리가 필요한 매장 리스트 (복사본 생성)
        List<InternalStoreData> pending = new ArrayList<>(stores);
        pending.sort(Comparator.comparingDouble(InternalStoreData::getDistance));

        while (!pending.isEmpty()) {
            // Android 제한 개수에 도달하면 중단 (가장 먼 매장들은 버림)
            if (finalPoints.size() >= ANDROID_GEOFENCE_LIMIT) {
                log.info("Geofence limit reached. Dropping remaining {} stores.", pending.size());
                break;
            }

            // 1. 기준점(Center) 선택: 현재 리스트에서 사용자와 가장 가까운 매장
            InternalStoreData center = pending.remove(0);

            // 2. 이웃 찾기: 기준점 반경 200m 이내에 있는 다른 매장들을 찾음
            List<InternalStoreData> neighbors = new ArrayList<>();
            Iterator<InternalStoreData> it = pending.iterator();

            while (it.hasNext()) {
                InternalStoreData candidate = it.next();
                // 두 매장 사이의 거리 계산 (Haversine Formula)
                double dist = calculateDistance(center.getLat(), center.getLon(), candidate.getLat(),
                        candidate.getLon());

                if (dist <= CLUSTER_DISTANCE_THRESHOLD) {
                    neighbors.add(candidate);
                    it.remove(); // 묶였으니 처리 대기 목록에서 제거
                }
            }

            // 3. 결과 생성
            if (neighbors.isEmpty()) {
                // 이웃이 없으면 -> 개별 매장(STORE) 등록
                finalPoints.add(createStorePoint(center));
            } else {
                // 이웃이 있으면 -> 클러스터(CLUSTER) 등록 (자기 자신 + 이웃들)
                neighbors.add(center);
                finalPoints.add(createClusterPoint(neighbors));
            }
        }

        return finalPoints;
    }

    // --- DTO 변환 메서드 ---

    private MapPoint createStorePoint(InternalStoreData store) {
        return MapPoint.builder()
                .type("STORE") // 클라이언트 처리: 반경 100m 등록, 진입 시 즉시 알림
                .id(String.valueOf(store.getStoreId()))
                .name(store.getStoreName())
                .lat(store.getLat())
                .lon(store.getLon())
                .triggerRadius(MICRO_STORE_RADIUS)
                .build();
    }

    private MapPoint createClusterPoint(List<InternalStoreData> clusterGroup) {
        // 중심점 좌표 계산 (평균)
        double avgLat = clusterGroup.stream().mapToDouble(InternalStoreData::getLat).average().orElse(0.0);
        double avgLon = clusterGroup.stream().mapToDouble(InternalStoreData::getLon).average().orElse(0.0);

        String title = clusterGroup.get(0).getStoreName() + " 외 " + (clusterGroup.size() - 1) + "곳";
        String representativeId = "C_" + clusterGroup.get(0).getStoreId();

        // 내부 매장 리스트를 상세 객체(StoreSummary)로 변환
        List<GeofenceDto.StoreSummary> summaryList = clusterGroup.stream()
                .map(store -> GeofenceDto.StoreSummary.builder()
                        .id(String.valueOf(store.getStoreId()))
                        .name(store.getStoreName())
                        .brandId(store.getBrandId()) // 프론트에서 브랜드 로고 찍어주려면 필요
                        .lat(store.getLat()) // 개별 좌표 포함!
                        .lon(store.getLon()) // 개별 좌표 포함!
                        .build())
                .toList();

        return MapPoint.builder()
                .type("CLUSTER") // 클라이언트 처리: 반경 300m 등록, 진입 시 앱 깨워서 상세 로직 수행
                .id(representativeId) // 대표 ID 사용
                .name(title)
                .lat(avgLat)
                .lon(avgLon)
                .triggerRadius(MICRO_CLUSTER_RADIUS) // 묶음이니까 반경을 좀 더 크게
                .includedStores(summaryList)
                .build();
    }

    private GeofenceDto.Response buildResponse(GeofenceDto.Request request, List<MapPoint> points) {
        return GeofenceDto.Response.builder()
                .center(GeofenceDto.CenterPoint.builder()
                        .lat(request.getLat())
                        .lon(request.getLon())
                        .refreshRadius(MACRO_REFRESH_RADIUS)
                        .build())
                .points(points)
                .build();
    }

    // --- 유틸리티 메서드 ---

    // 단순 하버사인 거리 계산 (미터 단위)
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double theta = lon1 - lon2;
        double dist = Math.sin(Math.toRadians(lat1)) * Math.sin(Math.toRadians(lat2)) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) * Math.cos(Math.toRadians(theta));
        dist = Math.acos(dist);
        dist = Math.toDegrees(dist);
        dist = dist * 60 * 1.1515 * 1609.344;
        return dist;
    }

    @Override
    public void handleEntryEvent(Long userId, GeofenceDto.EntryRequest request) {
        String geofenceId = request.getGeofenceId();

        // 1. 클러스터 여부 확인
        if (geofenceId.startsWith("C_")) {
            handleClusterEntry(userId, geofenceId);
        } else {
            handleStoreEntry(userId, geofenceId);
        }
    }

    private void handleStoreEntry(Long userId, String storeIdStr) {
        // 단일 매장: ID로 매장 정보 조회 -> 브랜드 확인 -> 기프티콘 확인
        try {
            Long storeId = Long.parseLong(storeIdStr);
            Map<String, String> storeInfo = getStoreInfo(storeId);

            if (storeInfo != null && !storeInfo.isEmpty()) {
                Integer brandId = Integer.parseInt(storeInfo.get("brandId"));
                String storeName = storeInfo.get("name");

                // 해당 브랜드의 사용 가능한 기프티콘 개수 확인
                int count = gifticonRepository.countByUserIdAndBrandIdAndStatus(userId, brandId,
                        GifticonStatus.NOT_USED);

                if (count > 0) {
                    // 알림 전송
                    fcmNotificationService.sendGeofenceNotification(userId, storeName, count);
                    // 쿨다운 설정 (12시간)
                    setCooldown(userId, String.valueOf(storeId));
                }
            }
        } catch (NumberFormatException e) {
            log.error("Invalid Store ID format: {}", storeIdStr);
        }
    }

    private void handleClusterEntry(Long userId, String clusterId) {
        // 클러스터: 대표 ID 추출 -> 주변 매장 검색 -> 포함된 모든 브랜드 수집 -> 기프티콘 확인
        String representativeIdStr = clusterId.substring(2); // "C_" 제거
        try {
            Long centerStoreId = Long.parseLong(representativeIdStr);
            Map<String, String> centerInfo = getStoreInfo(centerStoreId);

            if (centerInfo == null || centerInfo.isEmpty())
                return;

            double centerLat = Double.parseDouble(centerInfo.get("lat"));
            double centerLon = Double.parseDouble(centerInfo.get("lon"));

            // 클러스터 반경 내 매장 검색 (300m + 버퍼)
            GeoResults<RedisGeoCommands.GeoLocation<Object>> radiusResults = redisUtilService.getGeoRadius(
                    GEO_KEY, centerLat, centerLon, MICRO_CLUSTER_RADIUS + 50);

            if (radiusResults == null || radiusResults.getContent().isEmpty())
                return;

            // 검색된 매장들의 브랜드 ID 수집
            Set<Integer> brandIds = new HashSet<>();
            List<String> storeNames = new ArrayList<>();

            for (GeoResult<RedisGeoCommands.GeoLocation<Object>> geoResult : radiusResults.getContent()) {
                String foundStoreIdStr = geoResult.getContent().getName().toString();
                Map<String, String> info = getStoreInfo(Long.parseLong(foundStoreIdStr));
                if (info != null) {
                    brandIds.add(Integer.parseInt(info.get("brandId")));
                    storeNames.add(info.get("name"));
                }
            }

            // 브랜드들 중 기프티콘이 있는 것 확인
            int totalCount = 0;
            if (!brandIds.isEmpty()) {
                totalCount = gifticonRepository.countByUserIdAndBrandIdInAndStatus(userId, brandIds,
                        GifticonStatus.NOT_USED);
            }

            if (totalCount > 0) {
                // 대표 매장명 외 N곳
                String titleName = centerInfo.get("name") + " 외 " + (storeNames.size() - 1) + "곳";
                fcmNotificationService.sendGeofenceNotification(userId, titleName, totalCount);
                // 쿨다운 설정 (대표 매장 ID만 - 12시간)
                setCooldown(userId, representativeIdStr);
            }

        } catch (NumberFormatException e) {
            log.error("Invalid Cluster ID format: {}", clusterId);
        }
    }

    private Map<String, String> getStoreInfo(Long storeId) {
        String key = INFO_KEY_PREFIX + storeId;
        Map<Object, Object> rawMap = redisUtilService.getTemplate().opsForHash().entries(key);
        if (rawMap == null)
            return Collections.emptyMap();

        Map<String, String> result = new HashMap<>();
        for (Map.Entry<Object, Object> entry : rawMap.entrySet()) {
            result.put(entry.getKey().toString(), entry.getValue().toString());
        }
        return result;
    }

    // 내부 데이터 전송용 레코드
    private record GeoResultData(String storeId, double distance) {
    }

    // --- Cooldown Helpers ---

    private boolean isCooldown(Long userId, String storeId) {
        // "C_" 접두사가 있어도 제거하고 ID로 체크 (클러스터 대표 ID = Store ID)
        String realId = storeId.startsWith("C_") ? storeId.substring(2) : storeId;
        String key = COOLDOWN_KEY_PREFIX + userId + ":" + realId;
        return redisUtilService.existData(key);
    }

    private void setCooldown(Long userId, String storeId) {
        String realId = storeId.startsWith("C_") ? storeId.substring(2) : storeId;
        String key = COOLDOWN_KEY_PREFIX + userId + ":" + realId;
        // 12시간 = 12 * 60 * 60 * 1000 ms
        redisUtilService.setData(key, "1", 12 * 60 * 60 * 1000L);
    }
}