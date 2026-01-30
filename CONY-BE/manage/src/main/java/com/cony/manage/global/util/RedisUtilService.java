package com.cony.manage.global.util;

import lombok.RequiredArgsConstructor;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.GeoResults;
import org.springframework.data.redis.connection.RedisGeoCommands;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.domain.geo.GeoReference;
import org.springframework.data.redis.domain.geo.Metrics;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RedisUtilService {
    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * 데이터 저장 (Key - Value)
     * @param key 저장할 키 (예시: "RefreshToken:1", "RT:1")
     * @param value 저장할 값 (예시: 토큰 문자열)
     * @param expiredTimeMs 만료 시간 (ms 단위) - 시간이 만료되면 자동 삭제됨
     */
    public void setData(String key, String value, Long expiredTimeMs) {
        redisTemplate.opsForValue().set(key, value, expiredTimeMs, TimeUnit.MILLISECONDS);
    }

    /**
     * 데이터 조회
     * @param key 조회할 키값
     * @return 저장된 Value의 String값 (없다면 null 반환)
     */
    public String getData(String key) {
        Object value = redisTemplate.opsForValue().get(key);
        return value != null ? value.toString() : null;
    }

    /**
     * 데이터 삭제
     * @param key 삭제할 키값
     */
    public void deleteData(String key) {
        redisTemplate.delete(key);
    }

    /**
     * 데이터 존재 여부 확인
     * @param key 확인할 키값
     * @return 존재한다면 true, 아니면 false
     */
    public boolean existData(String key) {
        return redisTemplate.hasKey(key);
    }

    /**
     * GEO 조회: 특정 좌표 반경 내의 멤버 검색
     * @param key 키값
     * @param lat 위도
     * @param lon 경도
     * @param radiusMeter 좌표 반경
     * @return
     */
    public GeoResults<RedisGeoCommands.GeoLocation<Object>> getGeoRadius(String key, double lat, double lon, int radiusMeter) {
        return redisTemplate.opsForGeo().search(
                key,
                GeoReference.fromCoordinate(lon, lat),
                new Distance(radiusMeter, Metrics.METERS),
                RedisGeoCommands.GeoSearchCommandArgs.newGeoSearchArgs().includeDistance()
        );
    }

    /**
     * Pipeline 실행: 여러 명령어를 한번에 실행(네트워크 최적화)
     * Service 계층에서 넘어온 구체적인 로직(Callback)의 실행 담당.
     * @param action
     * @return
     */
    public List<Object> executePipeline(RedisCallback<Object> action) {
        return redisTemplate.executePipelined(action);
    }

    /**
     * 직렬화 도구 노출 (파이파라인 내부 키 변환에 사용)
     * 혹은 RedisSerializer를 직접 빈으로 주입받아도 되지만, 편의상 추가
     * @return
     */
    public RedisTemplate<String, Object> getTemplate() {
        return redisTemplate;
    }
}
