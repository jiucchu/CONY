package com.cony.manage.global.config;

import com.cony.manage.domain.geofence.entity.Store;
import jakarta.persistence.EntityManagerFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.database.JpaPagingItemReader;
import org.springframework.batch.item.database.builder.JpaPagingItemReaderBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.transaction.PlatformTransactionManager;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class StoreCacheBatchConfig {
    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;
    private final EntityManagerFactory entityManagerFactory;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final int CHUNK_SIZE = 1000;
    private static final String JOB_NAME = "storeCacheWarmUpJob";

    // === Job & Step 정의 ===
    @Bean
    public Job storeCacheJob() {
        return new JobBuilder(JOB_NAME, jobRepository)
                .start(storeCachStep())
                .build();
    }
    @Bean
    public Step storeCachStep() {
        return new StepBuilder("storeCacheStep", jobRepository)
                .<Store, Store>chunk(CHUNK_SIZE, transactionManager)
                .reader(storeReader())
                .writer(storeRedisWriter())
                .build();
    }

    // === Reader (DB 읽기) ===
    @Bean
    public JpaPagingItemReader<Store> storeReader() {
        return new JpaPagingItemReaderBuilder<Store>()
                .name("storeReader")
                .entityManagerFactory(entityManagerFactory)
                .pageSize(CHUNK_SIZE)
                .queryString("SELECT s FROM Store s JOIN FETCH s.brand")
                .build();
    }

    // === Writer (Redis 쓰기) ===
    @Bean
    public ItemWriter<Store> storeRedisWriter() {
        return chunk -> {
            // Redis Pipelining을 사용하여 네트워크 왕복 횟수 줄이기
            redisTemplate.executePipelined((RedisCallback<Object>) connection -> {
                RedisSerializer<String> stringSerializer = redisTemplate.getStringSerializer();

                for(Store store : chunk) {
                    String storeId = store.getId().toString();

                    // 1. GEO key 저장(좌표)
                    // Key: stores:geo
                    byte[] geoKey = stringSerializer.serialize("stores:geo");
                    connection.geoCommands().geoAdd(
                            geoKey,
                            new org.springframework.data.geo.Point(store.getGeom().getX(), store.getGeom().getY()),
                            stringSerializer.serialize(storeId)
                    );

                    // 2. Info Hash 저장(상세 정보)
                    // Key: store:info:{id}
                    byte[] infoKey = stringSerializer.serialize("store:info:" + storeId);

                    Map<byte[], byte[]> hashInfo = new HashMap<>();
                    hashInfo.put(stringSerializer.serialize("name"), stringSerializer.serialize(store.getStoreName()));
                    hashInfo.put(stringSerializer.serialize("brandId"), stringSerializer.serialize(store.getBrand().getId().toString()));
                    hashInfo.put(stringSerializer.serialize("lat"), stringSerializer.serialize(String.valueOf(store.getGeom().getY())));
                    hashInfo.put(stringSerializer.serialize("lon"), stringSerializer.serialize(String.valueOf(store.getGeom().getX())));

                    connection.hashCommands().hMSet(infoKey, hashInfo);
                }
                return null;
            });

            log.info("Redis Warmed up: {} stores processed", chunk.size());
        };
    }
}
