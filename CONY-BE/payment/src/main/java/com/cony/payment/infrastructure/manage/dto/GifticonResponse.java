package com.cony.payment.infrastructure.manage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * manage 서버에서 받아온 기프티콘 정보
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GifticonResponse {

    private Long gifticonId;
    private Integer brandId; // 브랜드 ID 추가
    private String brandName;
    private String productName;
    private String barcodeNumber;
    private LocalDate expiryDate;
    private String status; // NOT_USED, USED, EXPIRED 등
    private String imageUrl;
    private Integer originalPrice;
    private Integer currentBalance;
    private String categoryName;
    private String gifticonType; // PRODUCT, PREPAID
}
