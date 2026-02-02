package com.cony.payment.domain.recommend.dto;

import com.cony.payment.domain.recommend.enums.RecommendContext;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class RecommendResponseDto {
    private RecommendContext context;
    private Integer limit;
    private List<GifticonSummaryDto> items;

    @Getter
    @Builder
    public static class GifticonSummaryDto {
        private Long gifticonId;
        private String brandName;
        private String productName;
        private Integer dDay;
        private Integer originalPrice;
        private Integer discountRate;  // market만
        private Integer salePrice;     // market만
        private String imageUrl;
    }
}
