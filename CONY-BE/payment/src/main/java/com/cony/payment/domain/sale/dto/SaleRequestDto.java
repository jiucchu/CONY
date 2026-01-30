package com.cony.payment.domain.sale.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SaleRequestDto {

    @NotNull(message = "기프티콘 ID는 필수입니다.")
    private Long gifticonId;

    @NotNull(message = "정가는 필수입니다.")
    @Min(value = 100, message = "정가는 최소 100원 이상이어야 합니다.")
    private Integer originalPrice;

    @NotNull(message = "판매 가격은 필수입니다.")
    @Min(value = 100, message = "판매 가격은 최소 100원 이상이어야 합니다.")
    private Integer salePrice;

    // 자동판매 예정일 (null이면 즉시 판매, 미래 날짜면 해당일에 판매 시작)
    private LocalDate scheduledSaleDate;
}