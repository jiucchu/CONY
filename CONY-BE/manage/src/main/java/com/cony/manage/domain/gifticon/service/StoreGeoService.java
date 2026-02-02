package com.cony.manage.domain.gifticon.service;

import com.cony.manage.domain.gifticon.dto.NearbyBrandIdsResponse;
import com.cony.manage.global.util.RedisUtilService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.geo.GeoResult;
import org.springframework.data.geo.GeoResults;
import org.springframework.data.redis.connection.RedisGeoCommands;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class StoreGeoService {
    private final RedisUtilService redisUtilService;

    private static final String GEO_KEY = "stores:geo";
    private static final String INFO_KEY_PREFIX = "stores:info:";

    /**
     * 좌표 및 반경을 받아 '근처에 있는 브랜드 목록' 반환
     * @param lat 위도
     * @param lon 경도
     * @param radiusMeter 반경
     * @return 근처에 있는 브랜드 목록
     */
    public List<Long> getNearbyBrandIds(double lat, double lon, int radiusMeter) {
        GeoResults<RedisGeoCommands.GeoLocation<Object>> results = redisUtilService.getGeoRadius(GEO_KEY, lat, lon, radiusMeter);

        if(results == null || results.getContent().isEmpty()) {
            return Collections.emptyList();
        }

        List<String> storeIds = results.getContent().stream()
                .map(geoResult -> String.valueOf(geoResult.getContent().getName()))
                .toList();

        List<Object> brandIdListObj = redisUtilService.executePipeline(connection -> {
            for(String storeId : storeIds) {
                String key = INFO_KEY_PREFIX + storeId;

                connection.hGet(key.getBytes(StandardCharsets.UTF_8), "brandId".getBytes(StandardCharsets.UTF_8));
            }

            return null; // pipeline의 반환값은 의미 업음. null 반환
        });

        return brandIdListObj.stream()
                .map(obj -> {
                    try {
                        return Long.parseLong(String.valueOf(obj));
                    } catch(NumberFormatException e) {
                        log.warn("Invalid brandId format in Redis: {}", obj);
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .distinct()
                .toList();
    }


    /**
     * 좌표를 받아 '거리 구간별(200m, 500m, 1km)' 브랜드 ID 목록 반환
     * 1. 1km 반경 조회
     * 2. 거리순 정렬 (가까운 매장 우선)
     * 3. Pipeline으로 브랜드 ID 조회
     * 4. 중복 제거 및 구간별 담기
     */
    public NearbyBrandIdsResponse getNearbyBrandIdsByZones(double lat, double lon) {
        // 1. [GEO 조회] 반경 1km(1000m) 내의 모든 매장 조회
        // RedisUtilService의 getGeoRadius 사용
        GeoResults<RedisGeoCommands.GeoLocation<Object>> geoResults =
                redisUtilService.getGeoRadius(GEO_KEY, lat, lon, 1000);

        if (geoResults == null || geoResults.getContent().isEmpty()) {
            return new NearbyBrandIdsResponse(Collections.emptyList(), Collections.emptyList(), Collections.emptyList());
        }

        // 2. [정렬] RedisUtilService에 sortAscending이 없으므로 Java에서 거리순 정렬 수행
        // 정렬을 해야만 "가장 가까운 매장의 브랜드"를 우선적으로 처리할 수 있음
        List<GeoResult<RedisGeoCommands.GeoLocation<Object>>> sortedResults = new ArrayList<>(geoResults.getContent());
        sortedResults.sort(Comparator.comparingDouble(r -> r.getDistance().getValue()));

        // 3. [Pipeline 실행] 조회된 StoreId 순서대로 BrandId 조회 요청
        // sortedResults의 순서와 brandIdListObj의 순서는 정확히 일치함
        List<Object> brandIdListObj = redisUtilService.executePipeline(connection -> {
            for (GeoResult<RedisGeoCommands.GeoLocation<Object>> geoResult : sortedResults) {
                // RedisGeoCommands.GeoLocation<Object>에서 멤버(StoreId) 추출
                String storeId = String.valueOf(geoResult.getContent().getName());
                String key = INFO_KEY_PREFIX + storeId;

                // HGET stores:info:{storeId} brandId
                connection.hGet(key.getBytes(StandardCharsets.UTF_8), "brandId".getBytes(StandardCharsets.UTF_8));
            }
            return null;
        });

        // 4. [데이터 가공] 거리 정보와 매칭하여 구간별 분류
        Set<Integer> visitedBrands = new HashSet<>();
        List<Integer> zone200 = new ArrayList<>();
        List<Integer> zone500 = new ArrayList<>();
        List<Integer> zone1000 = new ArrayList<>();

        for (int i = 0; i < sortedResults.size(); i++) {
            // A. 거리 정보 (sortedResults에서 가져옴)
            GeoResult<RedisGeoCommands.GeoLocation<Object>> geoResult = sortedResults.get(i);
            double distanceM = geoResult.getDistance().getValue();

            // B. 브랜드 ID (Pipeline 결과에서 가져옴)
            Object obj = brandIdListObj.get(i);
            if (obj == null) continue; // 데이터가 깨졌거나 없는 경우 방어

            Integer brandId;
            try {
                // Redis Pipeline 결과(byte[] or String)를 Long으로 변환
                String val = (obj instanceof byte[]) ? new String((byte[]) obj, StandardCharsets.UTF_8) : String.valueOf(obj);
                brandId = Integer.parseInt(val);
            } catch (NumberFormatException e) {
                log.warn("Invalid brandId format in Redis: {}", obj);
                continue;
            }

            // C. [핵심 로직] 이미 더 가까운 거리에서 등록된 브랜드라면 패스
            if (visitedBrands.contains(brandId)) {
                continue;
            }

            // 처음 등장한 브랜드 -> 처리 목록에 추가
            visitedBrands.add(brandId);

            // D. 거리 구간별 리스트 삽입
            if (distanceM <= 200.0) {
                zone200.add(brandId);
            } else if (distanceM <= 500.0) {
                zone500.add(brandId);
            } else {
                zone1000.add(brandId); // 1000m 이내는 GeoRadius에서 이미 보장됨
            }
        }

        return new NearbyBrandIdsResponse(zone200, zone500, zone1000);
    }
}
