package com.cony.manage.global.util;

import com.cony.manage.domain.geofence.entity.Store;
import com.cony.manage.domain.geofence.repository.StoreRepository;
import com.cony.manage.domain.gifticon.entity.Brand;
import com.cony.manage.domain.gifticon.entity.Category;
import com.cony.manage.domain.gifticon.repository.BrandRepository;
import com.cony.manage.domain.gifticon.repository.CategoryRepository;
import com.cony.manage.infrastructure.image.FileUploader;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.test.JobLauncherTestUtils;
import org.springframework.batch.test.context.SpringBatchTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBatchTest
@SpringBootTest
@ActiveProfiles("test")
class StoreCacheBatchTest {

    @Autowired
    private JobLauncherTestUtils jobLauncherTestUtils;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @MockitoBean
    private FileUploader fileUploader;

    // JTS Geometry 생성을 위한 팩토리 (SRID 4326 = 위경도)
    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    @BeforeEach
    void setUp() {
        storeRepository.deleteAllInBatch();
        brandRepository.deleteAllInBatch();
        categoryRepository.deleteAllInBatch();
        redisTemplate.delete("stores:geo");

        // 1. 기존 데이터 정리 (충돌 방지)
        storeRepository.deleteAll();
        brandRepository.deleteAll();
        categoryRepository.deleteAll();
        redisTemplate.delete("stores:geo");

        // 2. 더미 카테고리 & 브랜드 생성
        Category category = Category.builder()
                .name("커피/음료")
                .build();
        categoryRepository.save(category);

        Brand starbucks = Brand.builder()
                .name("스타벅스")
                .category(category)
                .build();
        brandRepository.save(starbucks);

        // 3. 더미 매장 10개 생성
        List<Store> stores = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            // 위치를 조금씩 다르게 설정 (서울 강남역 인근 기준)
            double lat = 37.4980 + (i * 0.001); // 위도 약 100m씩 증가
            double lon = 127.0276 + (i * 0.001); // 경도 약 100m씩 증가

            Point geom = geometryFactory.createPoint(new Coordinate(lon, lat));

            Store store = Store.builder()
                    .brand(starbucks)
                    .storeName("스타벅스 강남 " + i + "호점")
                    .address("서울 강남구 테헤란로 " + i + "길")
                    .geom(geom)
                    .build();
            stores.add(store);
        }

        // 한 번에 저장 (Batch Insert)
        storeRepository.saveAll(stores);
    }

    @AfterEach
    void tearDown() {
        // 테스트 후 데이터 정리
        storeRepository.deleteAll();
        brandRepository.deleteAll();
        categoryRepository.deleteAll();

        // Redis 데이터 정리
        redisTemplate.delete("stores:geo");
        // store:info:* 패턴 삭제는 keys 명령어가 무거우니 생략하거나,
        // 테스트용 DB Index를 따로 쓰는 것이 정석입니다. 여기선 geo key만 확인.
    }

    @Test
    @DisplayName("배치 실행 시 10개의 매장 데이터가 Redis로 정상 이관되어야 한다")
    void batchJobTest() throws Exception {
        // given
        JobParameters jobParameters = new JobParametersBuilder()
                .addLong("time", System.currentTimeMillis()) // 유니크 파라미터
                .toJobParameters();

        // when
        // 배치 Job 실행
        JobExecution jobExecution = jobLauncherTestUtils.launchJob(jobParameters);

        // then
        // 1. 배치가 성공적으로 끝났는가?
        assertThat(jobExecution.getExitStatus().getExitCode()).isEqualTo("COMPLETED");

        // 2. Redis stores:geo 키가 존재하는가?
        Boolean hasKey = redisTemplate.hasKey("stores:geo");
        assertThat(hasKey).isTrue();

        // 3. Redis stores:geo 안에 데이터가 정확히 10개인가?
        Long count = redisTemplate.opsForZSet().zCard("stores:geo");
        assertThat(count).isEqualTo(10L);

        // 4. (선택) 마지막 매장의 상세 정보가 들어갔는지 샘플 확인
        // DB ID는 auto_increment라 정확히 알 수 없으니, 리스트에서 하나 가져옴
        Store lastStore = storeRepository.findAll().get(9);
        String infoKey = "store:info:" + lastStore.getId();

        Boolean hasInfoKey = redisTemplate.hasKey(infoKey);
        assertThat(hasInfoKey).isTrue();

        // 이름이 잘 들어갔는지 확인
        String storedName = (String) redisTemplate.opsForHash().get(infoKey, "name");
        assertThat(storedName).contains("스타벅스 강남");
    }
}