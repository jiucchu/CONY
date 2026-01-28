package com.cony.payment.domain.sale.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * 내 판매 통계 응답 DTO
 */
@Getter
@Builder
public class SaleStatsDto {
    private long pendingCount;   // 판매대기 개수
    private long onSaleCount;    // 판매중 개수
    private long soldOutCount;   // 판매완료 개수

    public long getTotalCount() {
        return pendingCount + onSaleCount + soldOutCount;
    }
}
