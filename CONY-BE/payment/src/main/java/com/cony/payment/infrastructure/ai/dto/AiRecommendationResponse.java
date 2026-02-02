package com.cony.payment.infrastructure.ai.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AiRecommendationResponse {
    private String status;
    private String message;
    private AiRecommendationData data;
}
