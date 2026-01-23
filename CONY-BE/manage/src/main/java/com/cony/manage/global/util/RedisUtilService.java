package com.cony.manage.global.util;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

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
}
