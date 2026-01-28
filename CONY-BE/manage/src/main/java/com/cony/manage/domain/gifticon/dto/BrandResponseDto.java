package com.cony.manage.domain.gifticon.dto;

import com.cony.manage.domain.gifticon.repository.BrandProjection;
import lombok.Builder;
import lombok.Getter;

@Getter @Builder
public class BrandResponseDto {
    private Integer brandId;
    private String brandName;
    private String iconUrl;

    public static BrandResponseDto toDto(BrandProjection projection) {
        return BrandResponseDto.builder()
                .brandId(projection.getId())
                .brandName(projection.getName())
                .iconUrl(projection.getIconUrl())
                .build();
    }
}
