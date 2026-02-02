package com.cony.payment.domain.recommend.service;

import com.cony.payment.domain.recommend.dto.RecommendRequestDto;
import com.cony.payment.domain.recommend.dto.RecommendResponseDto.GifticonSummaryDto;
import com.cony.payment.domain.recommend.dto.RecommendResponseDto;
import com.cony.payment.domain.recommend.enums.RecommendContext;
import com.cony.payment.domain.user.entity.User;
import com.cony.payment.domain.user.entity.UserInteractionLog;
import com.cony.payment.domain.user.repository.UserInteractionLogRepository;
import com.cony.payment.domain.user.repository.UserRepository;
import com.cony.payment.global.error.CustomException;
import com.cony.payment.global.error.ErrorCode;
import com.cony.payment.infrastructure.ai.client.AiClient;
import com.cony.payment.infrastructure.ai.dto.AiLogDto;
import com.cony.payment.infrastructure.ai.dto.AiRecommendationRequest;
import com.cony.payment.infrastructure.manage.client.ManageClient;
import com.cony.payment.infrastructure.manage.dto.GifticonResponse;
import com.cony.payment.infrastructure.manage.dto.NearbyStoreIdsResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import com.cony.payment.domain.sale.entity.Sale;
import com.cony.payment.domain.sale.enums.SaleStatus;
import com.cony.payment.domain.sale.repository.SaleRepository;

import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecommendServiceImpl implements RecommendService {
    private final UserRepository userRepository;
    private final UserInteractionLogRepository userInteractionLogRepository;
    private final ManageClient manageClient;
    private final SaleRepository saleRepository;
    private final AiClient aiClient;

    @Override
    public RecommendResponseDto getRecommendations(Long userId, RecommendRequestDto request) {
        userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        List<UserInteractionLog> userLogs = userInteractionLogRepository.findTop30ByUserIdOrderByCreatedAtDesc(userId);

        if (userLogs == null || userLogs.isEmpty() || userLogs.size() < 6) {
            List<RecommendResponseDto.GifticonSummaryDto> items = generalRecommend(request);
            return RecommendResponseDto.builder()
                    .context(RecommendContext.MARKET)
                    .limit(request.getLimit() != null ? request.getLimit() : 10)
                    .items(items)
                    .build();
        } else {
            List<RecommendResponseDto.GifticonSummaryDto> items = personalRecommendWithReturn(userLogs, request.getLimit() != null ? request.getLimit() : 10);
            if(items.isEmpty()) {
                items = generalRecommend(request);
            }

            return RecommendResponseDto.builder()
                    .context(RecommendContext.MARKET)
                    .limit(request.getLimit() != null ? request.getLimit() : 10)
                    .items(items)
                    .build();
        }

    }

    private List<RecommendResponseDto.GifticonSummaryDto> generalRecommend(RecommendRequestDto request) {
        // 1. 주변 매장 ID 조회 (거리별: 200m, 500m, 1km)
        // Manage 서버에서 이미 구간별로 분리되어 옴
        NearbyStoreIdsResponse brandIdsResponse = manageClient.getNearbyStoreIds(request.getLat(), request.getLon());

        if (brandIdsResponse == null) {
            return Collections.emptyList();
        }

        List<Integer> zone1Ids = brandIdsResponse.getWithin200(); // 0~200m
        List<Integer> zone2Ids = brandIdsResponse.getWithin500(); // 200~500m
        List<Integer> zone3Ids = brandIdsResponse.getWithin1000(); // 500~1000m

        // 모든 브랜드 ID 수집 (DB 조회용)
        Set<Integer> allBrandIds = new HashSet<>();
        allBrandIds.addAll(zone1Ids);
        allBrandIds.addAll(zone2Ids);
        allBrandIds.addAll(zone3Ids);

        if (allBrandIds.isEmpty()) {
            return Collections.emptyList();
        }

        // 2. DB에서 해당 브랜드들의 판매중인 상품 조회
        List<Sale> sales = saleRepository.findByBrandIdInAndStatus(allBrandIds, SaleStatus.ON_SALE);

        // 브랜드 ID별로 상품 그룹핑
        Map<Integer, List<Sale>> saleMap = sales.stream()
                .filter(s -> s.getBrandId() != null)
                .collect(Collectors.groupingBy(Sale::getBrandId));

        // 3. 거리 우선순위 + 유효기간 오름차순 정렬하여 리스트 생성
        List<Sale> sortedSales = new ArrayList<>();

        // Zone 1 (0~200m) 상품 추가 (유효기간 순)
        sortedSales.addAll(getSortedSalesByZone(saleMap, zone1Ids));

        // Zone 2 (200~500m) 상품 추가 (유효기간 순)
        sortedSales.addAll(getSortedSalesByZone(saleMap, zone2Ids));

        // Zone 3 (500~1000m) 상품 추가 (유효기간 순)
        sortedSales.addAll(getSortedSalesByZone(saleMap, zone3Ids));

        // 4. 요청된 limit 개수만큼 자르기
        int limit = request.getLimit() != null && request.getLimit() > 0 ? request.getLimit() : 10;
        List<Sale> limitedSales;
        if (sortedSales.size() > limit) {
            limitedSales = sortedSales.subList(0, limit);
        } else {
            limitedSales = sortedSales;
        }

        // 5. DTO 변환
        // (필요 시 Manage 서버에서 기프티콘 상세 정보를 가져와서 병합해야 함)
        // 현재 Sale 엔티티에는 상세 정보(이미지, 상품명 등)가 없으므로 ManageClient를 통해 조회
        return convertToGifticonSummaryDtos(limitedSales);
    }

    private List<Sale> getSortedSalesByZone(Map<Integer, List<Sale>> saleMap, List<Integer> zoneIds) {
        if (zoneIds == null || zoneIds.isEmpty())
            return Collections.emptyList();

        return zoneIds.stream()
                .map(saleMap::get) // 해당 브랜드의 상품 리스트 가져오기
                .filter(Objects::nonNull) // 상품이 있는 경우만
                .flatMap(List::stream) // 스트림 평탄화
                .sorted(Comparator.comparing(Sale::getExpiryDate, Comparator.nullsLast(Comparator.naturalOrder()))) // 유효기간
                                                                                                                    // 오름차순
                                                                                                                    // 정렬
                .collect(Collectors.toList());
    }

    private List<RecommendResponseDto.GifticonSummaryDto> personalRecommendWithReturn(List<UserInteractionLog> userLogs, int limit) {
        // 1. UserInteractionLog -> AiLogDto 변환
        List<AiLogDto> logDtos = userLogs.stream()
                .map(log -> AiLogDto.builder()
                        .saleId(log.getSale().getId())
                        .eventType(log.getEventType().name())
                        .build())
                .collect(Collectors.toList());

        // 2. AI 서버 요청
        AiRecommendationRequest aiRequest = AiRecommendationRequest.builder()
                .userLog(logDtos)
                .build();

        List<Long> recommendedSaleIds = aiClient.getRecommendations(aiRequest, limit);

        if (recommendedSaleIds == null || recommendedSaleIds.isEmpty()) {
            return Collections.emptyList();
        }

        // 3. 추천된 Sale ID로 로컬 DB 조회
        List<Sale> sales = saleRepository.findAllById(recommendedSaleIds);

        // 4. 순서 보장 (AI가 준 순서대로 정렬)
        Map<Long, Sale> saleMap = sales.stream()
                .collect(Collectors.toMap(Sale::getId, sale -> sale));

        List<Sale> sortedSales = recommendedSaleIds.stream()
                .map(saleMap::get)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        // 5. 기프티콘 상세 정보 조회 및 DTO 변환
        return convertToGifticonSummaryDtos(sortedSales);
    }

    private List<RecommendResponseDto.GifticonSummaryDto> convertToGifticonSummaryDtos(List<Sale> sales) {
        if (sales.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> gifticonIds = sales.stream().map(Sale::getGifticonId).collect(Collectors.toList());
        Map<Long, GifticonResponse> gifticonMap = manageClient.getGifticons(gifticonIds);

        return sales.stream()
                .map(sale -> {
                    GifticonResponse detailedInfo = gifticonMap.get(sale.getGifticonId());
                    return RecommendResponseDto.GifticonSummaryDto.builder()
                            .gifticonId(sale.getGifticonId())
                            .brandName(detailedInfo != null ? detailedInfo.getBrandName() : null)
                            .productName(detailedInfo != null ? detailedInfo.getProductName() : null)
                            .dDay(sale.getExpiryDate() != null
                                    ? (int) java.time.temporal.ChronoUnit.DAYS.between(java.time.LocalDate.now(),
                                            sale.getExpiryDate())
                                    : null)
                            .originalPrice(sale.getOriginalPrice())
                            .discountRate(sale.getDiscountRate())
                            .salePrice(sale.getSalePrice())
                            .imageUrl(detailedInfo != null ? detailedInfo.getImageUrl() : null)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
