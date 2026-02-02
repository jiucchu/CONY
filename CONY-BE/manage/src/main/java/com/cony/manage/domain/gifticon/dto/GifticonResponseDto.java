package com.cony.manage.domain.gifticon.dto;

import com.cony.manage.domain.gifticon.enums.GifticonStatus;
import com.cony.manage.domain.gifticon.enums.GifticonType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GifticonResponseDto {
    private Long gifticonId;
    private Long userId;
    private Integer brandId; // Integer로 변경
    private String brandName;
    private String productName;
    private String barcodeNumber;
    private LocalDate expiryDate;
    private GifticonStatus status;
    private String imageUrl;
    private Integer originalPrice;
    private Integer currentBalance;
    private String categoryName;
    private GifticonType gifticonType;
}
