package com.cony.manage.domain.gifticon.dto;

import com.cony.manage.domain.gifticon.enums.GifticonStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

// 목록 조회용 dto
@Getter
@Builder
public class GifticonListResponseDto {
    private Long gifticonId;
    private String brandName;
    private String productName;
    private String barcodeNumber;
    private LocalDate expiryDate;
    private GifticonStatus status;
    private String imageUrl;        // 썸네일 이미지
}
