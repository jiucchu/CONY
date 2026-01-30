package com.cony.payment.infrastructure.manage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Manage 서버에서 받아오는 기프티콘 정보
 */
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GifticonInfo {

    private Long gifticonId;
    private String brandName;
    private String productName;
    private String imageUrl;
    private LocalDate expiryDate;
    private String categoryName;
    private Long originalPrice;

    /**
     * D-day 계산 (유효기간까지 남은 일수)
     */
    public int getDDay() {
        if (expiryDate == null) {
            return 0;
        }
        return (int) java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), expiryDate);
    }
}
