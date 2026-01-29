package com.cony.payment.domain.recommend.dto;

import lombok.Builder;
import lombok.Getter;


// 추천 응답 공통 DTO (기프티콘 상세 정보)
@Getter
@Builder
public class GifticonSummaryDto {
    private Long gifticonId;
    private String brandName;
    private String productName;
    private Integer dDay;
    private Integer originalPrice;
    private Integer discountRate;  // market만
    private Integer salePrice;     // market만
    private String imageUrl;
}

