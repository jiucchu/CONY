package com.cony.payment.domain.sale.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum

SaleCategory {
    ALL("전체"),
    CAFE("카페"),
    CONVENIENCE("편의점");

    private final String description;
}
