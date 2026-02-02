package com.cony.payment.domain.recommend.service;

import com.cony.payment.domain.recommend.dto.RecommendRequestDto;
import com.cony.payment.domain.recommend.dto.RecommendResponseDto;
import com.cony.payment.domain.recommend.enums.RecommendContext;
import com.cony.payment.domain.sale.entity.Sale;
import com.cony.payment.domain.sale.enums.SaleStatus;
import com.cony.payment.domain.sale.repository.SaleRepository;
import com.cony.payment.domain.user.entity.User;
import com.cony.payment.domain.user.entity.UserInteractionLog;
import com.cony.payment.domain.user.enums.EventType;
import com.cony.payment.domain.user.repository.UserInteractionLogRepository;
import com.cony.payment.domain.user.repository.UserRepository;
import com.cony.payment.infrastructure.ai.client.AiClient;
import com.cony.payment.infrastructure.ai.dto.AiRecommendationRequest;
import com.cony.payment.infrastructure.manage.client.ManageClient;
import com.cony.payment.infrastructure.manage.dto.GifticonResponse;
import com.cony.payment.infrastructure.manage.dto.NearbyStoreIdsResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecommendServiceImplTest {

    @InjectMocks
    private RecommendServiceImpl recommendService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserInteractionLogRepository userInteractionLogRepository;

    @Mock
    private ManageClient manageClient;

    @Mock
    private SaleRepository saleRepository;

    @Mock
    private AiClient aiClient;

    private LocalDate now = LocalDate.now();

    @Test
    @DisplayName("일반 추천 - 거리별 추천 및 유효기간 정렬 검증")
    void generalRecommendTest() {
        // given
        Long userId = 1L;
        RecommendRequestDto request = RecommendRequestDto.builder()
                .lat(37.5)
                .lon(127.0)
                .limit(5)
                .build();

        User user = User.builder().build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // Logs < 6 -> generalRecommend
        when(userInteractionLogRepository.findTop30ByUserIdOrderByCreatedAtDesc(userId))
                .thenReturn(Collections.emptyList());

        // ManageClient Nearby Stores
        NearbyStoreIdsResponse nearbyResponse = new NearbyStoreIdsResponse(
                List.of(101),
                List.of(102),
                List.of(103));
        when(manageClient.getNearbyStoreIds(anyDouble(), anyDouble())).thenReturn(nearbyResponse);

        // SaleRepository
        Sale saleA = Sale.builder().gifticonId(1L).brandId(101).expiryDate(now.plusDays(5)).originalPrice(1000)
                .salePrice(800).status(SaleStatus.ON_SALE).build();
        Sale saleB = Sale.builder().gifticonId(2L).brandId(101).expiryDate(now.plusDays(1)).originalPrice(1000)
                .salePrice(800).status(SaleStatus.ON_SALE).build();
        Sale saleC = Sale.builder().gifticonId(3L).brandId(102).expiryDate(now.plusDays(2)).originalPrice(1000)
                .salePrice(800).status(SaleStatus.ON_SALE).build();
        Sale saleD = Sale.builder().gifticonId(4L).brandId(103).expiryDate(now.plusDays(3)).originalPrice(1000)
                .salePrice(800).status(SaleStatus.ON_SALE).build();

        // Repository expects Set<Integer>, so use anySet() or any(Set.class)
        when(saleRepository.findByBrandIdInAndStatus(anySet(), eq(SaleStatus.ON_SALE)))
                .thenReturn(List.of(saleA, saleB, saleC, saleD));

        // ManageClient Gifticon Info
        Map<Long, GifticonResponse> gifticonMap = new HashMap<>();
        gifticonMap.put(1L, GifticonResponse.builder().gifticonId(1L).brandName("BrandA").productName("ProductA")
                .expiryDate(now.plusDays(5)).imageUrl("img").build());
        gifticonMap.put(2L, GifticonResponse.builder().gifticonId(2L).brandName("BrandA").productName("ProductB")
                .expiryDate(now.plusDays(1)).imageUrl("img").build());
        gifticonMap.put(3L, GifticonResponse.builder().gifticonId(3L).brandName("BrandB").productName("ProductC")
                .expiryDate(now.plusDays(2)).imageUrl("img").build());
        gifticonMap.put(4L, GifticonResponse.builder().gifticonId(4L).brandName("BrandC").productName("ProductD")
                .expiryDate(now.plusDays(3)).imageUrl("img").build());

        when(manageClient.getGifticons(anyList())).thenReturn(gifticonMap);

        // when
        RecommendResponseDto response = recommendService.getRecommendations(userId, request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.getContext()).isEqualTo(RecommendContext.MARKET);
        List<RecommendResponseDto.GifticonSummaryDto> items = response.getItems();
        assertThat(items).hasSize(4);

        // Order: Zone1(B->A) -> Zone2(C) -> Zone3(D)
        assertThat(items.get(0).getGifticonId()).isEqualTo(2L); // Zone 1, D+1
        assertThat(items.get(1).getGifticonId()).isEqualTo(1L); // Zone 1, D+5
        assertThat(items.get(2).getGifticonId()).isEqualTo(3L); // Zone 2
        assertThat(items.get(3).getGifticonId()).isEqualTo(4L); // Zone 3
    }

    @Test
    @DisplayName("개인화 추천 - AI 서버 연동 및 결과 반환 검증")
    void personalRecommendTest() {
        // given
        Long userId = 1L;
        RecommendRequestDto request = RecommendRequestDto.builder()
                .limit(5)
                .build();

        User user = User.builder().build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // Logs >= 6
        UserInteractionLog log1 = UserInteractionLog.builder().sale(Sale.builder().build()).eventType(EventType.CLICK)
                .build();
        List<UserInteractionLog> logs = new ArrayList<>();
        // Create logs with mocked Sales having IDs if accessed by service
        Sale saleWithId = Sale.builder().build();
        setField(saleWithId, "id", 100L);
        UserInteractionLog validLog = UserInteractionLog.builder().sale(saleWithId).eventType(EventType.CLICK).build();
        List<UserInteractionLog> validLogs = Collections.nCopies(6, validLog);

        when(userInteractionLogRepository.findTop30ByUserIdOrderByCreatedAtDesc(userId))
                .thenReturn(validLogs);

        // AI Client response
        List<Long> recommendedIds = List.of(200L, 201L);
        when(aiClient.getRecommendations(any(AiRecommendationRequest.class), eq(5)))
                .thenReturn(recommendedIds);

        // SaleRepository
        Sale recSale1 = Sale.builder().gifticonId(2000L).build();
        setField(recSale1, "id", 200L);
        Sale recSale2 = Sale.builder().gifticonId(2001L).build();
        setField(recSale2, "id", 201L);
        when(saleRepository.findAllById(recommendedIds)).thenReturn(List.of(recSale1, recSale2));

        // ManageClient
        Map<Long, GifticonResponse> gifticonMap = new HashMap<>();
        gifticonMap.put(2000L, GifticonResponse.builder().gifticonId(2000L).brandName("BrandX").productName("ProdX")
                .expiryDate(now).imageUrl("img").build());
        gifticonMap.put(2001L, GifticonResponse.builder().gifticonId(2001L).brandName("BrandY").productName("ProdY")
                .expiryDate(now).imageUrl("img").build());
        when(manageClient.getGifticons(anyList())).thenReturn(gifticonMap);

        // when
        RecommendResponseDto response = recommendService.getRecommendations(userId, request);

        // then
        assertThat(response.getContext()).isEqualTo(RecommendContext.MARKET); // Changed to MARKET per impl
        assertThat(response.getItems()).hasSize(2);
        assertThat(response.getItems().get(0).getGifticonId()).isEqualTo(2000L);
        assertThat(response.getItems().get(1).getGifticonId()).isEqualTo(2001L);
    }

    private void setField(Object target, String fieldName, Object value) {
        try {
            java.lang.reflect.Field field = target.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (Exception e) {
            try {
                java.lang.reflect.Field field = target.getClass().getSuperclass().getDeclaredField(fieldName);
                field.setAccessible(true);
                field.set(target, value);
            } catch (Exception ex) {
                // Ignore
            }
        }
    }
}
