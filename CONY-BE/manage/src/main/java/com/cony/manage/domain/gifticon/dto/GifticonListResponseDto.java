package com.cony.manage.domain.gifticon.dto;

import com.cony.manage.domain.gifticon.enums.GifticonStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

// 목록 조회용 dto
@Getter
@Builder
@Schema(description = "기프티콘 목록 조회 응답")
public class GifticonListResponseDto {
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
    
    @Schema(description = "기프티콘 상태 (NOT_USED, IN_USE, USED)", example = "NOT_USED")
    private GifticonStatus status;
    
    @Schema(description = "기프티콘 썸네일 이미지 URL", example = "https://example.com/thumbnail.jpg")
    private String imageUrl;        // 썸네일 이미지

    @Schema(description = "원가", example = "4500")
    private Integer originalPrice;
}