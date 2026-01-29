package com.cony.payment.domain.recommend.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

// 추천 응답 공통 DTO (기프티콘 상세 정보)
@Getter
@Builder
public class GifticonSummaryDto {
    private Long gifticonId;
    private String brandName;
    private String productName;
    private LocalDate expiryDate;
    private Integer originalPrice;
    private String barcodeNumber;
    private String imageUrl;
    private String categoryName;
    private String gifticonType;
}
