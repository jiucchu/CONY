package com.cony.payment.infrastructure.ai.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.List;

@Getter
@NoArgsConstructor
public class AiRecommendationData {
    private Integer limit;
    private List<Long> items;
}
