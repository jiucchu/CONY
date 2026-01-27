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
import org.springframework.batch.repeat.RepeatStatus;
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
    private static final String GEO_KEY = "stores:geo"; // 상수화

    @Bean
    public Job storeCacheJob() {
        return new JobBuilder(JOB_NAME, jobRepository)
                .start(initRedisStep()) // [추가] 1단계: 기존 GEO 키 삭제
                .next(storeCacheStep()) // 2단계: 데이터 적재
                .build();
    }

    // [추가] Redis GEO Key 초기화 Step (깔끔한 시작을 위해)
    @Bean
    public Step initRedisStep() {
        return new StepBuilder("initRedisStep", jobRepository)
                .tasklet((contribution, chunkContext) -> {
                    redisTemplate.delete(GEO_KEY);
                    log.info(">>>> [Batch] Existing GEO Key ({}) Deleted.", GEO_KEY);
                    return RepeatStatus.FINISHED;
                }, transactionManager)
                .build();
    }

    @Bean
    public Step storeCacheStep() {
        return new StepBuilder("storeCacheStep", jobRepository)
                .<Store, Store>chunk(CHUNK_SIZE, transactionManager)
                .reader(storeReader())
                .writer(storeRedisWriter())
                .build();
    }

    // === Reader ===
    @Bean
    public JpaPagingItemReader<Store> storeReader() {
        return new JpaPagingItemReaderBuilder<Store>()
                .name("storeReader")
                .entityManagerFactory(entityManagerFactory)
                .pageSize(CHUNK_SIZE)
                // [수정] JOIN FETCH 제거 -> Batch Size 설정으로 N+1 해결 권장
//                .queryString("SELECT s FROM Store s WHERE s.status = 'OPEN' ORDER BY s.id ASC")
                .queryString("SELECT s FROM Store s ORDER BY s.id ASC")
                .build();
    }

    // === Writer ===
    @Bean
    public ItemWriter<Store> storeRedisWriter() {
        return chunk -> {
            redisTemplate.executePipelined((RedisCallback<Object>) connection -> {
                // [최적화] Serializer 조회는 루프 밖에서 1번만
                RedisSerializer<String> stringSerializer = redisTemplate.getStringSerializer();
                byte[] geoKeyBytes = stringSerializer.serialize(GEO_KEY);

                for (Store store : chunk) {
                    // 방어 로직: 좌표 없으면 Skip
                    if (store.getGeom() == null) continue;

                    String storeId = store.getId().toString();

                    // 1. GEO ADD
                    connection.geoCommands().geoAdd(
                            geoKeyBytes,
                            new org.springframework.data.geo.Point(store.getGeom().getX(), store.getGeom().getY()),
                            stringSerializer.serialize(storeId)
                    );

                    // 2. Info Hash
                    byte[] infoKey = stringSerializer.serialize("stores:info:" + storeId);
                    Map<byte[], byte[]> hashInfo = new HashMap<>();

                    hashInfo.put(stringSerializer.serialize("name"), stringSerializer.serialize(store.getStoreName()));

                    // Brand가 Lazy Loading이어도 Batch Size 설정 있으면 성능 문제 없음
                    if (store.getBrand() != null) {
                        hashInfo.put(stringSerializer.serialize("brandId"), stringSerializer.serialize(store.getBrand().getId().toString()));
                        hashInfo.put(stringSerializer.serialize("brandName"), stringSerializer.serialize(store.getBrand().getName())); // 브랜드명도 캐싱 추천
                    }

                    hashInfo.put(stringSerializer.serialize("lat"), stringSerializer.serialize(String.valueOf(store.getGeom().getY())));
                    hashInfo.put(stringSerializer.serialize("lon"), stringSerializer.serialize(String.valueOf(store.getGeom().getX())));

                    connection.hashCommands().hMSet(infoKey, hashInfo);
                }
                return null;
            });
            log.info(">>>> [Batch] Flushed {} stores to Redis.", chunk.size());
        };
    }
}