package com.cony.payment.domain.purchase.entity;

import com.cony.payment.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "purchase")
public class Purchase extends BaseTimeEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "purchase_id")
    private Long id;

    @Column(nullable = false)
    private Long saleId;

    @Column(nullable = false)
    private Long buyerId;

    @Column(nullable = false)
    private Long price;

    @Builder
    public Purchase(Long saleId, Long buyerId, Long price) {
        this.saleId = saleId;
        this.buyerId = buyerId;
        this.price = price;
    }
}