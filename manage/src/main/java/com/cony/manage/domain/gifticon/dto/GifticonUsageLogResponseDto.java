package com.cony.manage.domain.gifticon.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class GifticonUsageLogResponseDto {
    private Long logId;
    private Integer usedAmount;
    private LocalDateTime usedAt;
}
