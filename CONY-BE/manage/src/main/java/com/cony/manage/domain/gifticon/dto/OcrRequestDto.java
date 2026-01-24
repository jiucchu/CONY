package com.cony.manage.domain.gifticon.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OcrRequestDto {
    private String imageUrl;
    private String imageType;
}
