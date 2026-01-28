package com.cony.manage.domain.gifticon.service;

import com.cony.manage.global.util.RedisUtilService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.geo.GeoResults;
import org.springframework.data.redis.connection.RedisGeoCommands;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

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
}
