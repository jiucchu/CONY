package com.cony.payment.infrastructure.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AiRecommendationRequest {
    @JsonProperty("user_log")
    private List<AiLogDto> userLog;
}
