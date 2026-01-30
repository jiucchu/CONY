package com.cony.manage.domain.gifticon.dto;

import com.cony.manage.domain.gifticon.entity.Gifticon;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
@Schema(description = "자동판매 대상 기프티콘 응답")
public class AutoSaleTargetResponseDto {

    @Schema(description = "기프티콘 ID")
    private Long gifticonId;

    @Schema(description = "소유자 ID")
    private Long userId;

    @Schema(description = "브랜드명")
    private String brandName;

    @Schema(description = "상품명")
    private String productName;

    @Schema(description = "원가")
    private Integer originalPrice;

    @Schema(description = "판매 예정 금액")
    private Integer plannedSalePrice;

    @Schema(description = "유효기간")
    private LocalDate expiryDate;

    @Schema(description = "이미지 URL")
    private String imageUrl;

    public static AutoSaleTargetResponseDto from(Gifticon gifticon, String imageUrl) {
        return AutoSaleTargetResponseDto.builder()
                .gifticonId(gifticon.getId())
                .userId(gifticon.getUser().getId())
                .brandName(gifticon.getBrandName())
                .productName(gifticon.getProductName())
                .originalPrice(gifticon.getOriginalPrice())
                .plannedSalePrice(gifticon.getPlannedSalePrice())
                .expiryDate(gifticon.getExpiryDate())
                .imageUrl(imageUrl)
                .build();
    }
}
