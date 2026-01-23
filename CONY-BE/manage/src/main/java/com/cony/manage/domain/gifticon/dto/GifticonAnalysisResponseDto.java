package com.cony.manage.domain.gifticon.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class GifticonAnalysisResponseDto { // AI의 응답결과를 받을 dto
    private OcrFields fields;
    private List<String> needsReview;
    private String imageUrl;

    @Getter
    @Builder
    public static class OcrFields {
        private String brandName;
        private String productName;
        private Integer originalPrice;
        private String expiryDate;
        private String gifticonType;
        private String barcodeNumber;
    }
}
