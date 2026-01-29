package com.cony.payment.infrastructure.manage.dto;

import lombok.Getter;

import java.util.List;

@Getter
public class PageResponse<T> {
    private List<T> content;
}
