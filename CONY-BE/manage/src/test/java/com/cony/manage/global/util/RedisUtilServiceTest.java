package com.cony.manage.global.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class RedisUtilServiceTest {
    @Autowired private RedisUtilService redisUtilService;

    @Test
    @DisplayName("Redis 데이터 저장 & 조회")
    void redisTest() {
        // given
        String key = "test:key";
        String value = "hello_redis";
        Long duration = 10000L; // 10s

        // when
        redisUtilService.setData(key, value, duration);
        String result = redisUtilService.getData(key);

        // then
        assertEquals(value, result);

        // cleanup
        redisUtilService.deleteData(key);
    }
}