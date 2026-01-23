package com.cony.manage.domain.gifticon.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@Schema(description = "기프티콘 분석 결과 응답")
public class GifticonAnalysisResponseDto { // AI의 응답결과를 받을 dto
    
    @Schema(description = "분석된 기프티콘 필드 정보")
    private OcrFields fields;
    
    @Schema(description = "사용자 확인이 필요한 필드 목록")
    private List<String> needsReview;
    
    @Schema(description = "기프티콘 이미지 URL")
    private String imageUrl;

    @Getter
    @Builder
    @Schema(description = "OCR로 분석된 필드 상세 정보")
    public static class OcrFields {
        @Schema(description = "브랜드명", example = "스타벅스")
        private String brandName;
        @Schema(description = "상품명", example = "아이스 아메리카노 T")
        private String productName;
        @Schema(description = "원가", example = "4500")
        private Integer originalPrice;
        @Schema(description = "유효기간", example = "2024-12-31")
        private String expiryDate;
        @Schema(description = "기프티콘 타입", example = "PRODUCT")
        private String gifticonType;
        @Schema(description = "바코드 번호", example = "123456789012")
        private String barcodeNumber;
    }
}