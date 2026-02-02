package com.cony.payment.domain.recommend.dto;

import com.cony.payment.domain.recommend.enums.RecommendContext;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RecommendRequestDto {
    private RecommendContext context;
    private Integer limit;
    private Double lat;
    private Double lon;

}
