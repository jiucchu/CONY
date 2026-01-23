package com.cony.payment.domain.point.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PointResponse {

    private Long userId;
    private Long pointBalance;
    private Long chargedAmount;   // 충전 금액 (선택)
    private Long deductedAmount;  // 차감 금액 (선택)
}