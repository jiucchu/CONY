package com.cony.manage.domain.geofence.service;

import com.cony.manage.domain.geofence.dto.GeofenceDto;
import com.cony.manage.domain.geofence.dto.GeofenceDto.MapPoint;
import com.cony.manage.global.util.RedisUtilService;
import net.bytebuddy.build.BuildLogger;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.GeoResult;
import org.springframework.data.geo.GeoResults;
import org.springframework.data.geo.Point;
import org.springframework.data.redis.connection.RedisGeoCommands;
import org.springframework.data.redis.domain.geo.Metrics;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class) // Mockito 사용 선언
class GeofenceServiceTest {

    @InjectMocks
    private GeofenceServiceImpl geofenceService; // 테스트 대상

    @Mock
    private RedisUtilService redisUtilService;   // 가짜 Redis 유틸

    // 테스트용 기준 좌표 (서울 강남역 인근)
    private final double USER_LAT = 37.4980;
    private final double USER_LON = 127.0276;

    @Test
    @DisplayName("브랜드 필터링: 내가 보유한 브랜드의 매장만 반환되어야 한다")
    void filterByBrandId() {
        // given
        GeofenceDto.Request request = createRequest(Arrays.asList(1L, 2L)); // 나는 브랜드 1, 2번만 가짐

        // 1. Redis GEO 검색 결과 Mocking (매장 3개 발견)
        List<GeoResult<RedisGeoCommands.GeoLocation<Object>>> geoResults = Arrays.asList(
                createGeoResult("100", 50.0),  // ID: 100, 거리 50m
                createGeoResult("200", 1000.0), // ID: 200, 거리 100m
                createGeoResult("300", 1500.0)  // ID: 300, 거리 150m
        );
        mockGeoSearch(geoResults);

        // 2. Redis Pipeline 상세 정보 조회 결과 Mocking
        List<Object> pipelineResults = Arrays.asList(
                createStoreInfoMap("스타벅스", "1", USER_LAT, USER_LON),   // 브랜드 1 (보유 O)
                createStoreInfoMap("투썸플레이스", "2", USER_LAT + 0.01, USER_LON), // 브랜드 2 (보유 O)
                createStoreInfoMap("빽다방", "3", USER_LAT, USER_LON + 0.01)       // 브랜드 3 (보유 X -> 걸러져야 함)
        );
        mockPipelineExecution(pipelineResults);

        // when
        GeofenceDto.Response response = geofenceService.getNearbyStores(request);

        // then
        assertThat(response.getPoints()).hasSize(2); // 3개 중 1개 걸러지고 2개만 나와야 함
        assertThat(response.getPoints())
                .extracting("type")
                .containsOnly("STORE"); // 모두 개별 매장이어야 함
        assertThat(response.getPoints())
                .extracting("name")
                .containsExactly("스타벅스", "투썸플레이스");
    }

    @Test
    @DisplayName("클러스터링: 200m 이내에 있는 매장들은 하나의 CLUSTER로 묶여야 한다")
    void groupingNearbyStores() {
        // given
        GeofenceDto.Request request = createRequest(Arrays.asList(1L));

        // 1. GEO 검색: 매우 가까운 매장 3개, 멀리 떨어진 매장 1개
        List<GeoResult<RedisGeoCommands.GeoLocation<Object>>> geoResults = Arrays.asList(
                createGeoResult("1", 10.0),   // 아주 가까움
                createGeoResult("2", 20.0),   // 아주 가까움 (1번과 뭉쳐야 함)
                createGeoResult("3", 30.0),   // 아주 가까움 (1,2번과 뭉쳐야 함)
                createGeoResult("4", 500.0)   // 500m 떨어짐 (혼자 있어야 함)
        );
        mockGeoSearch(geoResults);

        // 2. 상세 정보 (좌표가 중요)
        // 1,2,3번은 강남역 코앞(거의 동일 좌표), 4번은 역삼역 쪽이라 가정
        List<Object> pipelineResults = Arrays.asList(
                createStoreInfoMap("매장1", "1", USER_LAT, USER_LON),
                createStoreInfoMap("매장2", "1", USER_LAT + 0.0001, USER_LON), // 위도 아주 조금 차이
                createStoreInfoMap("매장3", "1", USER_LAT, USER_LON + 0.0001), // 경도 아주 조금 차이
                createStoreInfoMap("매장4", "1", USER_LAT + 0.01, USER_LON + 0.01) // 멀리 있음
        );
        mockPipelineExecution(pipelineResults);

        // when
        GeofenceDto.Response response = geofenceService.getNearbyStores(request);

        // then
        List<MapPoint> points = response.getPoints();
        assertThat(points).hasSize(2); // (매장1+2+3) 묶음 1개 + (매장4) 1개 = 총 2개

        // 클러스터 확인
        MapPoint cluster = points.stream().filter(p -> "CLUSTER".equals(p.getType())).findFirst().orElseThrow();
        assertThat(cluster.getName()).contains("외 2곳"); // "매장1 외 2곳" 형태
        assertThat(cluster.getTriggerRadius()).isEqualTo(300); // 클러스터 반경 확인

        // 단일 매장 확인
        MapPoint store = points.stream().filter(p -> "STORE".equals(p.getType())).findFirst().orElseThrow();
        assertThat(store.getName()).isEqualTo("매장4");
        assertThat(store.getTriggerRadius()).isEqualTo(100); // 일반 매장 반경 확인
    }

    @Test
    @DisplayName("빈 결과: 주변에 매장이 없으면 빈 리스트를 반환해야 한다")
    void emptyResult() {
        // given
        GeofenceDto.Request request = createRequest(Collections.singletonList(1L));

        // Redis GEO 검색 결과가 비어있음
        mockGeoSearch(Collections.emptyList());

        // when
        GeofenceDto.Response response = geofenceService.getNearbyStores(request);

        // then
        assertThat(response.getPoints()).isEmpty();
        assertThat(response.getCenter()).isNotNull(); // 센터 좌표는 있어야 함
    }

    // --- Helper Methods (테스트 데이터 생성용) ---

    private GeofenceDto.Request createRequest(List<Long> brandIds) {
        return GeofenceDto.Request.builder()
                .userLat(USER_LAT)
                .userLon(USER_LON)
                .brandIds(brandIds)
                .build();
    }

    // Redis GEO 조회 결과(`GeoResult`)를 가짜로 만드는 헬퍼
    private GeoResult<RedisGeoCommands.GeoLocation<Object>> createGeoResult(String memberId, double dist) {
        return new GeoResult<>(
                new RedisGeoCommands.GeoLocation<>(memberId, new Point(USER_LON, USER_LAT)),
                new Distance(dist, Metrics.METERS)
        );
    }

    // Redis Hash 조회 결과(`Map`)를 가짜로 만드는 헬퍼
    private Map<String, String> createStoreInfoMap(String name, String brandId, double lat, double lon) {
        return Map.of(
                "name", name,
                "brandId", brandId,
                "lat", String.valueOf(lat),
                "lon", String.valueOf(lon)
        );
    }

    // --- Mocking Helpers ---

    private void mockGeoSearch(List<GeoResult<RedisGeoCommands.GeoLocation<Object>>> results) {
        // GeoResults 래퍼 객체 생성
        GeoResults<RedisGeoCommands.GeoLocation<Object>> geoResultsWrapper = new GeoResults<>(results);

        when(redisUtilService.getGeoRadius(anyString(), anyDouble(), anyDouble(), anyInt()))
                .thenReturn(geoResultsWrapper);
    }

    private void mockPipelineExecution(List<Object> returnList) {
        // executePipeline 메서드가 호출되면 준비한 List<Map>을 리턴하도록 설정
        when(redisUtilService.executePipeline(any())).thenReturn(returnList);
    }
}