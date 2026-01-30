package com.cony.payment.domain.user.dto;

import com.cony.payment.domain.user.entity.UserInteractionLog;
import com.cony.payment.domain.user.enums.EventType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class UserInteractionLogResponseDto {
    private Long interactionId;
    private Long userId;
    private Long saleId;
    private EventType eventType;
    private LocalDateTime createdAt;

    public static UserInteractionLogResponseDto from(UserInteractionLog log) {
        return UserInteractionLogResponseDto.builder()
                .interactionId(log.getId())
                .userId(log.getUser().getId())
                .saleId(log.getSale().getId())
                .eventType(log.getEventType())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
