package com.cony.payment.domain.sale.entity;

import com.cony.payment.domain.sale.enums.SaleStatus;
import com.cony.payment.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "sale")
public class Sale extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sale_id")
    private Long id;

    @Column(nullable = false)
    private Long sellerId;

    @Column(nullable = false)
    private Long gifticonId;

    @Column(name = "brand_id")
    private Integer brandId; // 브랜드 ID (추천 서비스 조회용)

    @Column(name = "expiry_date")
    private LocalDate expiryDate; // 유효기간 (추천 정렬용)

    @Column(name = "original_price", nullable = false)
    private Integer originalPrice; // 정가

    @Column(name = "sale_price", nullable = false)
    private Integer salePrice; // 판매 가격

    @Column(name = "discount_rate", nullable = false)
    private Integer discountRate; // 할인율 (정수)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SaleStatus status;

    // 자동판매 예정일 (PENDING 상태일 때, 이 날짜가 되면 ON_SALE로 변경)
    @Column(name = "scheduled_sale_date")
    private LocalDate scheduledSaleDate;

    // 조회 성능을 위한 필드 추가
    @Column(name = "brand_id")
    private Integer brandId;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Builder
    public Sale(Long sellerId, Long gifticonId, Integer originalPrice, Integer salePrice,
                SaleStatus status, LocalDate scheduledSaleDate,
                Integer brandId, LocalDate expiryDate) {
        this.sellerId = sellerId;
        this.gifticonId = gifticonId;
        this.brandId = brandId; // 브랜드 ID 저장
        this.expiryDate = expiryDate; // 유효기간 저장
        this.originalPrice = originalPrice;
        this.salePrice = salePrice;
        this.discountRate = calculateDiscountRate(originalPrice, salePrice);
        this.scheduledSaleDate = scheduledSaleDate;
        this.brandId = brandId;
        this.expiryDate = expiryDate;

        // scheduledSaleDate가 있으면 PENDING, 없으면 ON_SALE
        if (scheduledSaleDate != null && scheduledSaleDate.isAfter(LocalDate.now())) {
            this.status = SaleStatus.PENDING;
        } else {
            this.status = (status != null) ? status : SaleStatus.ON_SALE;
        }
    }

    // 할인율 계산
    private Integer calculateDiscountRate(Integer originalPrice, Integer salePrice) {
        if (originalPrice == null || originalPrice <= 0) {
            return 0;
        }

        return (int) Math.round((1 - (double) salePrice / originalPrice) * 100);
    }

    // 판매 가격 수정
    public void updatePrice(Integer newSalePrice) {
        this.salePrice = newSalePrice;
        this.discountRate = calculateDiscountRate(this.originalPrice, newSalePrice);
    }

    // 구매 시 상태 변경 메서드
    public void soldOut() {
        this.status = SaleStatus.SOLD_OUT;
    }

    // 판매 시작 (대기 -> 판매중)
    public void startSale() {
        this.status = SaleStatus.ON_SALE;
    }

    // 판매 대기 상태로 변경
    public void setPending() {
        this.status = SaleStatus.PENDING;
    }

    // 하위 호환성을 위한 price getter (salePrice 반환)
    public Integer getPrice() {
        return this.salePrice;
    }
}