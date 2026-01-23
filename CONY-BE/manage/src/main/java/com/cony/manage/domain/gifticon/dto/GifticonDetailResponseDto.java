package com.cony.manage.domain.gifticon.dto;

import com.cony.manage.domain.gifticon.enums.GifticonStatus;
import com.cony.manage.domain.gifticon.enums.GifticonType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

// 상세 조회용 dto
@Getter
@Builder
public class GifticonDetailResponseDto {
    private Long gifticonId;
    private String brandName;
    private String productName;
    private String barcodeNumber;
    private LocalDate expiryDate;
    private GifticonStatus status;
    private String imageUrl;        // 썸네일 이미지

    // 상세에서만 보여줄 추가 정보들
    private Integer originalPrice;
    private Integer currentBalance; // 잔액권일 경우 중요
    private String categoryName;
    private GifticonType gifticonType;

    private List<GifticonUsageLogResponseDto> histories;
}