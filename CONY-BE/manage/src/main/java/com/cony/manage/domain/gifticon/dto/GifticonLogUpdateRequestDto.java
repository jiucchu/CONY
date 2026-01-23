package com.cony.manage.domain.gifticon.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class GifticonLogUpdateRequestDto {
    @NotNull(message = "수정할 금액을 입력해주세요.")
    @Min(value = 1, message = "금액은 0원보다 커야합니다.")
    private Integer newAmount;
}
