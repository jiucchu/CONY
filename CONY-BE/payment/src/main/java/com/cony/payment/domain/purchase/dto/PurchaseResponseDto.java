package com.cony.payment.domain.purchase.dto;

import com.cony.payment.domain.purchase.entity.Purchase;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PurchaseResponseDto {
    private Long purchaseId;
    private Long saleId;
    private Long buyerId;
    private Integer price;
    private LocalDateTime createdAt;

    public static PurchaseResponseDto from(Purchase purchase) {
        return PurchaseResponseDto.builder()
                .purchaseId(purchase.getId())
                .buyerId(purchase.getBuyerId())
                .price(purchase.getPurchasePrice())
                .createdAt(purchase.getCreatedAt())
                .build();
    }
}
