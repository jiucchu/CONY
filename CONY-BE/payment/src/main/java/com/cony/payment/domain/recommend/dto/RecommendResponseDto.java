package com.cony.payment.domain.recommend.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class RecommendResponseDto {
    private String context;
    private int limit;
    private List<GifticonSummaryDto> items;
}
