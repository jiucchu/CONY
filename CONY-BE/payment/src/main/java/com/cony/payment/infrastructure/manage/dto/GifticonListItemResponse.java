package com.cony.payment.infrastructure.manage.dto;

import lombok.Getter;

import java.time.LocalDate;

@Getter
public class GifticonListItemResponse {
    private Long gifticonId;
    private String brandName;
    private String productName;
    private String barcodeNumber;
    private LocalDate expiryDate;
    private String status;
    private String imageUrl;
}
