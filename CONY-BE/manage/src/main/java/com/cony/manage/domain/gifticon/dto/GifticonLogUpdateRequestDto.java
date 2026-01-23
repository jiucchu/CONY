package com.cony.manage.domain.gifticon.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Schema(description = "기프티콘 사용 내역 금액 수정 요청")
public class GifticonLogUpdateRequestDto {
    @NotNull(message = "수정할 금액을 입력해주세요.")
    @Min(value = 1, message = "금액은 0원보다 커야합니다.")
    @Schema(description = "새로운 사용 금액", example = "4000", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer newAmount;
}