package com.cony.payment.domain.sale.entity;

import com.cony.payment.domain.sale.enums.SaleStatus;
import com.cony.payment.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "sale")
public class Sale extends BaseTimeEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sale_id")
    private Long id;

    @Column(nullable = false)
    private Long sellerId;

    @Column(nullable = false)
    private Long gifticonId;

    @Column(name = "original_price", nullable = false)
    private Long originalPrice; // 정가

    @Column(name = "sale_price", nullable = false)
    private Long salePrice; // 판매 가격

    @Column(name = "discount_rate", nullable = false)
    private Double discountRate; // 할인율

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SaleStatus status;

    @Builder
    public Sale(Long sellerId, Long gifticonId, Long originalPrice, Long salePrice) {
        this.sellerId = sellerId;
        this.gifticonId = gifticonId;
        this.originalPrice = originalPrice;
        this.salePrice = salePrice;
        this.discountRate = calculateDiscountRate(originalPrice, salePrice);
        this.status = SaleStatus.ON_SALE;
    }

    // 할인율 계산
    private Double calculateDiscountRate(Long originalPrice, Long salePrice) {
        if (originalPrice == null || originalPrice <= 0) {
            return 0.0;
        }
        return Math.round((1 - (double) salePrice / originalPrice) * 100 * 10) / 10.0;
    }

    // 판매 가격 수정
    public void updatePrice(Long newSalePrice) {
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
    public Long getPrice() {
        return this.salePrice;
    }
}