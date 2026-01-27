package com.cony.payment.global.util;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RedisUtilService {
    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * 데이터 저장 (TTL 포함)
     */
    public void setData(String key, String value, Long expiredTimeMs) {
        redisTemplate.opsForValue().set(key, value, expiredTimeMs, TimeUnit.MILLISECONDS);
    }

    /**
     * 데이터 조회
     */
    public String getData(String key) {
        Object value = redisTemplate.opsForValue().get(key);
        return value != null ? value.toString() : null;
    }

    /**
     * 데이터 삭제
     */
    public void deleteData(String key) {
        redisTemplate.delete(key);
    }

    /**
     * 데이터 존재 여부 확인
     */
    public boolean existData(String key) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }
}
