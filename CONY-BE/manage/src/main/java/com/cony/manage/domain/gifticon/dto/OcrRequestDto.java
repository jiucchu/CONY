package com.cony.manage.domain.gifticon.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OcrRequestDto {
    @JsonProperty("image_url")
    private String imageUrl;
    @JsonProperty("image_type")
    private String imageType;
}
