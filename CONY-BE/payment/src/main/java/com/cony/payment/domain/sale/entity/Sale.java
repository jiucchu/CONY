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

    @Column(nullable = false)
    private Long price; // 판매 가격

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SaleStatus status;

    @Builder
    public Sale(Long sellerId, Long gifticonId, Long price) {
        this.sellerId = sellerId;
        this.gifticonId = gifticonId;
        this.price = price;
        this.status = SaleStatus.ON_SALE; // 기본값 판매중
    }

    // 구매 시 상태 변경 메서드
    public void soldOut() {
        this.status = SaleStatus.SOLD_OUT;
    }
}