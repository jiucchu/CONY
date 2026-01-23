package com.cony.manage.domain.gifticon.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Schema(description = "기프티콘 사용 요청")
public class GifticonUseRequestDto {
    @Schema(description = "사용 금액 (상품권일 경우 원가, 금액권일 경우 사용 액수)", example = "4500")
    private Integer amount;
}