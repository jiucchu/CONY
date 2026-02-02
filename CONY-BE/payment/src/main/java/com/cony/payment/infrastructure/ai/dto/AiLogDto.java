package com.cony.payment.infrastructure.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AiLogDto {
    @JsonProperty("sale_id")
    private Long saleId;

    @JsonProperty("event_type")
    private String eventType;
}
