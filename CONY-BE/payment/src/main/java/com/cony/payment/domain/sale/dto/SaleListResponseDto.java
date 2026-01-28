package com.cony.payment.domain.sale.dto;

import com.cony.payment.domain.sale.entity.Sale;
import com.cony.payment.domain.sale.enums.SaleStatus;
import com.cony.payment.infrastructure.manage.dto.GifticonResponse;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * 판매 목록 응답 DTO (기프티콘 정보 포함)
 */
@Getter
@Builder
public class SaleListResponseDto {

    // 판매 정보
    private Long saleId;
    private Long sellerId;
    private Long gifticonId;

    // 가격 정보
    private Integer originalPrice;      // 정가
    private Integer salePrice;          // 판매가
    private Double discountRate;     // 할인율

    // 기프티콘 정보 (Manage 서버에서 조회)
    private String brandName;
    private String productName;
    private String imageUrl;
    private LocalDate expiryDate;
    private String categoryName;
    private Integer dDay;            // 유효기간까지 남은 일수

    // 판매 상태
    private SaleStatus status;
    private LocalDateTime createdAt;

    /**
     * Sale 엔티티 + GifticonResponse로 DTO 생성
     */
    public static SaleListResponseDto of(Sale sale, GifticonResponse gifticon) {
        int dDay = 0;
        LocalDate expiryDate = null;
        String brandName = null;
        String productName = null;
        String imageUrl = null;
        String categoryName = null;

        if (gifticon != null) {
            expiryDate = gifticon.getExpiryDate();
            brandName = gifticon.getBrandName();
            productName = gifticon.getProductName();
            imageUrl = gifticon.getImageUrl();
            categoryName = gifticon.getCategoryName();

            if (expiryDate != null) {
                dDay = (int) ChronoUnit.DAYS.between(LocalDate.now(), expiryDate);
            }
        }

        return SaleListResponseDto.builder()
                .saleId(sale.getId())
                .sellerId(sale.getSellerId())
                .gifticonId(sale.getGifticonId())
                .originalPrice(sale.getOriginalPrice())
                .salePrice(sale.getSalePrice())
                .discountRate(sale.getDiscountRate())
                .brandName(brandName)
                .productName(productName)
                .imageUrl(imageUrl)
                .expiryDate(expiryDate)
                .categoryName(categoryName)
                .dDay(dDay)
                .status(sale.getStatus())
                .createdAt(sale.getCreatedAt())
                .build();
    }

    /**
     * Sale 엔티티만으로 DTO 생성 (기프티콘 정보 없음)
     */
    public static SaleListResponseDto from(Sale sale) {
        return of(sale, null);
    }
}
