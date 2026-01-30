package com.cony.manage.domain.gifticon.dto;

import com.cony.manage.domain.gifticon.enums.GifticonType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@Schema(description = "기프티콘 등록 요청")
public class GifticonRegisterRequestDto { // OCR, 사용자 검수까지 마친 최종 등록 요청 dto
    
    @Schema(description = "브랜드명", example = "스타벅스")
    private String brandName;
    
    @Schema(description = "상품명", example = "아이스 아메리카노 T")
    private String productName;
    
    @Schema(description = "카테고리명", example = "카페")
    private String categoryName;
    
    @Schema(description = "바코드 번호", example = "123456789012")
    private String barcodeNumber;
    
    @Schema(description = "유효기간", example = "2024-12-31")
    private LocalDate expiryDate;
    
    @Schema(description = "원가", example = "4500")
    private Integer originalPrice;
    
    @Schema(description = "기프티콘 타입 (PRODUCT: 교환권, PREPAID: 금액권)", example = "PRODUCT")
    private GifticonType type;

    @Schema(description = "기프티콘 이미지 URL", example = "https://example.com/image.jpg")
    private String imageUrl;

    // === 자동판매 설정 === //
    @Schema(description = "판매 예정일 (자동판매 시, null이면 자동판매 OFF)", example = "2024-11-30")
    private LocalDate scheduledSaleDate;

    @Schema(description = "판매 예정 금액 (자동판매 시)", example = "4000")
    private Integer plannedSalePrice;
}