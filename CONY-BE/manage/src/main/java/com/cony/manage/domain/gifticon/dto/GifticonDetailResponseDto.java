package com.cony.manage.domain.gifticon.dto;

import com.cony.manage.domain.gifticon.enums.GifticonStatus;
import com.cony.manage.domain.gifticon.enums.GifticonType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

// 상세 조회용 dto
@Getter
@Builder
@Schema(description = "기프티콘 상세 조회 응답")
public class GifticonDetailResponseDto {
    @Schema(description = "기프티콘 ID", example = "1")
    private Long gifticonId;
    
    @Schema(description = "브랜드명", example = "스타벅스")
    private String brandName;
    
    @Schema(description = "상품명", example = "아이스 아메리카노 T")
    private String productName;
    
    @Schema(description = "바코드 번호", example = "123456789012")
    private String barcodeNumber;
    
    @Schema(description = "유효기간", example = "2024-12-31")
    private LocalDate expiryDate;
    
    @Schema(description = "기프티콘 상태", example = "NOT_USED")
    private GifticonStatus status;
    
    @Schema(description = "기프티콘 원본 이미지 URL", example = "https://example.com/original.jpg")
    private String imageUrl;        // 썸네일 이미지

    // 상세에서만 보여줄 추가 정보들
    @Schema(description = "원가", example = "4500")
    private Integer originalPrice;
    
    @Schema(description = "현재 잔액 (금액권일 경우)", example = "4500")
    private Integer currentBalance; // 잔액권일 경우 중요
    
    @Schema(description = "카테고리명", example = "카페")
    private String categoryName;
    
    @Schema(description = "기프티콘 타입", example = "PRODUCT")
    private GifticonType gifticonType;

    // === 자동판매 설정 === //
    @Schema(description = "판매 예정일", example = "2024-11-30")
    private LocalDate scheduledSaleDate;

    @Schema(description = "판매 예정 금액", example = "4000")
    private Integer plannedSalePrice;

    @Schema(description = "사용 이력 목록")
    private List<GifticonUsageLogResponseDto> histories;
}
