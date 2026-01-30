package com.cony.payment.domain.user.dto;

import com.cony.payment.domain.user.enums.EventType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class UserInteractionLogRequestDto {

    @NotNull(message = "saleId는 필수입니다.")
    @Min(value = 1, message = "saleId는 1 이상이어야 합니다.")
    private Long saleId;

    @NotNull(message = "eventType은 필수입니다.")
    private EventType eventType;
}
