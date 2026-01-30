package com.cony.payment.infrastructure.manage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 자동판매 대상 기프티콘 응답 DTO (Manage 서버 연동용)
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutoSaleTargetResponse {

    private Long gifticonId;
    private Long userId;
    private String brandName;
    private String productName;
    private Integer originalPrice;
    private Integer plannedSalePrice;
    private LocalDate expiryDate;
    private String imageUrl;
}
