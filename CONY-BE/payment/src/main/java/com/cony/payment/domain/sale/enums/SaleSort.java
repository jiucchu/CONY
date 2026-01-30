package com.cony.payment.domain.sale.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SaleSort {
    LATEST("등록순"),      // 최신 등록순
    EXPIRY("기간순"),      // 유효기간 임박순
    DISTANCE("거리순");    // 현재 위치 기준 거리순

    private final String description;
}
