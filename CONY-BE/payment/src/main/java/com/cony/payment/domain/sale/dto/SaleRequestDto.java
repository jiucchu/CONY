package com.cony.payment.domain.sale.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class SaleRequestDto {

    @NotNull(message = "기프티콘 ID는 필수입니다.")
    private Long gifticonId;

    @NotNull(message = "판매 가격은 필수입니다.")
    @Min(value = 100, message = "판매 가격은 최소 100원 이상이어야 합니다.")
    private Long price;


}