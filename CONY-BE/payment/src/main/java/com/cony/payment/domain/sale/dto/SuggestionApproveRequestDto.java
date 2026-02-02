package com.cony.payment.domain.sale.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SuggestionApproveRequestDto {

    @NotNull(message = "기프티콘 ID는 필수입니다.")
    private Long gifticonId;

    /**
     * 판매가격 (선택)
     * - null이면 기본 20% 할인 적용
     */
    private Integer salePrice;
}
