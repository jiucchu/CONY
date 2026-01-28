package com.cony.payment.domain.sale.dto;

import com.cony.payment.domain.sale.entity.Sale;
import com.cony.payment.domain.sale.enums.SaleStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SaleResponseDto {
    private Long saleId;
    private Long sellerId;
    private Long gifticonId;
    private Long price;
    private SaleStatus status;
    private LocalDateTime createdAt;

    public static SaleResponseDto from(Sale sale) {
        return SaleResponseDto.builder()
                .saleId(sale.getId())
                .sellerId(sale.getSellerId())
                .gifticonId(sale.getGifticonId())
                .price(sale.getPrice())
                .status(sale.getStatus())
                .createdAt(sale.getCreatedAt())
                .build();
    }
}
