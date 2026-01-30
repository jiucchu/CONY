package com.cony.manage.domain.gifticon.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

// 수정 요청 dto
@Getter
@NoArgsConstructor
@Schema(description = "기프티콘 정보 수정 요청")
public class GifticonUpdateRequestDto {
    @NotBlank(message = "브랜드명을 입력하세요.")
    @Schema(description = "브랜드명", example = "스타벅스", requiredMode = Schema.RequiredMode.REQUIRED)
    private String brandName;

    @NotBlank(message = "상품명을 입력하세요.")
    @Schema(description = "상품명", example = "아이스 아메리카노 T", requiredMode = Schema.RequiredMode.REQUIRED)
    private String productName;

    @NotNull(message = "유효기간을 입력해주세요.")
    @Schema(description = "유효기간", example = "2024-12-31", requiredMode = Schema.RequiredMode.REQUIRED)
    private LocalDate expiryDate;

    @Schema(description = "원가 (수정 시)", example = "4500")
    private Integer originalPrice;

    // === 자동판매 설정 === //
    @Schema(description = "판매 예정일 (자동판매 시, null이면 자동판매 OFF)", example = "2024-11-30")
    private LocalDate scheduledSaleDate;

    @Schema(description = "판매 예정 금액 (자동판매 시)", example = "4000")
    private Integer plannedSalePrice;
}