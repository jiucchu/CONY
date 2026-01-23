package com.cony.manage.domain.gifticon.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

// 수정 요청 dto
@Getter
@NoArgsConstructor
public class GifticonUpdateRequestDto {
    @NotBlank(message = "브랜드명을 입력하세요.")
    private String brandName;

    @NotBlank(message = "상품명을 입력하세요.")
    private String productName;

    @NotNull(message = "유효기간을 입력해주세요.")
    private LocalDate expiryDate;

    private Integer originalPrice;
}
