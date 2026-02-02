package com.cony.manage.domain.geofence.service;

import com.cony.manage.domain.geofence.dto.GeofenceDto;
import com.cony.manage.domain.gifticon.enums.GifticonStatus;
import com.cony.manage.domain.gifticon.repository.GifticonRepository;
import com.cony.manage.domain.user.service.FcmNotificationService;
import com.cony.manage.global.util.RedisUtilService;
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
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.domain.geo.Metrics;

import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GeofenceEntryNotificationTest {

        @InjectMocks
        private GeofenceServiceImpl geofenceService;

        @Mock
        private RedisUtilService redisUtilService;

        @Mock
        private FcmNotificationService fcmNotificationService;

        @Mock
        private GifticonRepository gifticonRepository;

        @Mock
        private RedisTemplate<String, Object> redisTemplate;

        @Mock
        private HashOperations<String, Object, Object> hashOperations;

        @Test
        @DisplayName("단일 매장 진입: 사용 가능한 기프티콘이 있으면 알림을 보내고 쿨다운을 설정한다")
        void handleStoreEntry_ShouldSendNotification_WhenGifticonExists() {
                // given
                Long userId = 1L;
                String storeId = "100";
                GeofenceDto.EntryRequest request = GeofenceDto.EntryRequest.builder()
                                .geofenceId(storeId)
                                .build();

                // Redis Mocking (매장 정보)
                when(redisUtilService.getTemplate()).thenReturn(redisTemplate);
                when(redisTemplate.opsForHash()).thenReturn(hashOperations);

                Map<Object, Object> storeInfo = new HashMap<>(); // 제네릭 타입 일치시킴
                storeInfo.put("brandId", "1");
                storeInfo.put("name", "스타벅스 강남점");
                when(hashOperations.entries("stores:info:" + storeId)).thenReturn(storeInfo);

                // Repository Mocking (기프티콘 개수)
                when(gifticonRepository.countByUserIdAndBrandIdAndStatus(eq(userId), eq(1L),
                                eq(GifticonStatus.NOT_USED)))
                                .thenReturn(3);

                // when
                geofenceService.handleEntryEvent(userId, request);

                // then
                // 1. 알림 전송 확인
                verify(fcmNotificationService).sendGeofenceNotification(userId, "스타벅스 강남점", 3);
                // 2. 쿨다운 설정 확인
                verify(redisUtilService).setData(eq("geofence:cooldown:1:100"), eq("1"), anyLong());
        }

        @Test
        @DisplayName("클러스터 진입: 주변 매장을 검색하고 알림을 보낸 후 대표 ID로 쿨다운을 설정한다")
        void handleClusterEntry_ShouldSendNotification_WhenGifticonsExist() {
                // given
                Long userId = 1L;
                String clusterId = "C_100"; // 대표 ID: 100
                GeofenceDto.EntryRequest request = GeofenceDto.EntryRequest.builder()
                                .geofenceId(clusterId)
                                .build();

                // 1. 대표 매장 정보 Mocking
                when(redisUtilService.getTemplate()).thenReturn(redisTemplate);
                when(redisTemplate.opsForHash()).thenReturn(hashOperations);

                Map<Object, Object> centerInfo = new HashMap<>();
                centerInfo.put("brandId", "1");
                centerInfo.put("name", "스타벅스 강남점");
                centerInfo.put("lat", "37.5");
                centerInfo.put("lon", "127.0");
                when(hashOperations.entries("stores:info:100")).thenReturn(centerInfo);

                // 2. 주변 매장 검색 결과 Mocking (100번 매장, 200번 매장)
                List<GeoResult<RedisGeoCommands.GeoLocation<Object>>> geoResults = Arrays.asList(
                                createGeoResult("100", 0),
                                createGeoResult("200", 50));
                when(redisUtilService.getGeoRadius(anyString(), anyDouble(), anyDouble(), anyInt()))
                                .thenReturn(new GeoResults<>(geoResults));

                // 3. 각 매장 상세 정보 Mocking
                // 100번은 이미 위에서 정의
                // 200번 매장 정보
                Map<Object, Object> store200Info = new HashMap<>();
                store200Info.put("brandId", "2");
                store200Info.put("name", "투썸플레이스");
                when(hashOperations.entries("stores:info:200")).thenReturn(store200Info);

                // 4. 기프티콘 보유 확인 Mocking (브랜드 1, 2 중 하나라도 있음)
                when(gifticonRepository.countByUserIdAndBrandIdInAndStatus(eq(userId), anySet(),
                                eq(GifticonStatus.NOT_USED)))
                                .thenReturn(5);

                // when
                geofenceService.handleEntryEvent(userId, request);

                // then
                // 1. 알림 전송 확인 (제목에 '외 N곳' 포함)
                verify(fcmNotificationService).sendGeofenceNotification(eq(userId), contains("외 1곳"), eq(5));
                // 2. 쿨다운 설정 확인 (대표 ID인 100번만 설정되어야 함)
                verify(redisUtilService).setData(eq("geofence:cooldown:1:100"), eq("1"), anyLong());
        }

        private GeoResult<RedisGeoCommands.GeoLocation<Object>> createGeoResult(String memberId, double dist) {
                return new GeoResult<>(
                                new RedisGeoCommands.GeoLocation<>(memberId, new Point(127.0, 37.5)),
                                new Distance(dist, Metrics.METERS));
        }
}
