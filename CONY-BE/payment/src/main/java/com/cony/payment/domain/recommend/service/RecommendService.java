package com.cony.payment.domain.recommend.service;

import com.cony.payment.domain.recommend.dto.GifticonSummaryDto;
import com.cony.payment.domain.recommend.dto.RecommendResponseDto;
import com.cony.payment.domain.recommend.enums.RecommendContext;
import com.cony.payment.global.error.CustomException;
import com.cony.payment.global.error.ErrorCode;
import com.cony.payment.infrastructure.manage.client.ManageClient;
import com.cony.payment.infrastructure.manage.dto.GifticonListItemResponse;
import com.cony.payment.infrastructure.manage.dto.GifticonResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecommendService {

    private final ManageClient manageClient;

    public RecommendResponseDto getRecommendations(Long userId, String contextRaw, int limit, Double lat, Double lon, String authorization) {
        RecommendContext context = RecommendContext.from(contextRaw);
        if (context == null) {
            throw new CustomException(ErrorCode.INVALID_INPUT_VALUE);
        }
        if (limit < 1 || limit > 20) {
            throw new CustomException(ErrorCode.INVALID_INPUT_VALUE);
        }

        // owned: 보유한 기프티콘 기반 추천
        if (context == RecommendContext.OWNED) {
            return getOwnedRecommendations(limit, lat, lon);
        }

        // TODO: market_basic -> market_personal
        return RecommendResponseDto.builder()
                .context(context.toResponseValue())
                .limit(limit)
                .items(Collections.emptyList())
                .build();
    }

    // 보유 기프티콘 기반 추천
    private RecommendResponseDto getOwnedRecommendations(int limit, Double lat, Double lon) {
        // 1) manage 서버에서 보유 기프티콘 목록 조회
        List<GifticonListItemResponse> list = manageClient.getMyGifticons(limit);

        // 2) 기프티콘 리스트에서 ID 값 추출
        List<Long> gifticonIds = list.stream()
                .map(GifticonListItemResponse::getGifticonId)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        // 3) ID 기반 상세 조회
        Map<Long, GifticonResponse> gifticonMap = manageClient.getGifticons(gifticonIds);

        // 4) 요약 DTO 변환
        List<GifticonSummaryDto> items = gifticonIds.stream()
                .map(gifticonMap::get)
                .filter(Objects::nonNull)
                .map(this::toSummary)
                .collect(Collectors.toList());

        return RecommendResponseDto.builder()
                .context(RecommendContext.OWNED.toResponseValue())
                .limit(limit)
                .items(items)
                .build();
    }

    // GifticonResponse를 추천 DTO(GifticonSummaryDto)로 매핑
    private GifticonSummaryDto toSummary(GifticonResponse gifticon) {
        Integer dDay = calculateDDay(gifticon.getExpiryDate());

        return GifticonSummaryDto.builder()
                .gifticonId(gifticon.getGifticonId())
                .brandName(gifticon.getBrandName())
                .productName(gifticon.getProductName())
                .dDay(dDay)
                .originalPrice(gifticon.getOriginalPrice())
                .discountRate(null)
                .salePrice(null)
                .imageUrl(gifticon.getImageUrl())
                .build();
    }

    // D-Day 계산
    private Integer calculateDDay(LocalDate expiryDate) {
        if (expiryDate == null) {
            return null;
        }
        return (int) ChronoUnit.DAYS.between(LocalDate.now(), expiryDate);
    }
}
