package com.cony.manage.domain.gifticon.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "기프티콘 사용 내역 취소 요청")
public class GifticonCancelRequest {
    @NotNull(message = "금액권(false), 상품권(true)")
    @Schema(description = "금액권", example = "false", requiredMode = Schema.RequiredMode.REQUIRED)
    boolean isProduct;
}
