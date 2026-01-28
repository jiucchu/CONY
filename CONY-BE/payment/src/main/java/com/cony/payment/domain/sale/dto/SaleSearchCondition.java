package com.cony.payment.domain.sale.dto;

import com.cony.payment.domain.sale.enums.SaleCategory;
import com.cony.payment.domain.sale.enums.SaleSort;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SaleSearchCondition {

    private String keyword;      // 검색어 (브랜드명, 상품명)
    private SaleCategory category;  // 카테고리 (ALL, CAFE, CONVENIENCE)
    private String brand;        // 브랜드명 필터
    private SaleSort sort;       // 정렬 (LATEST, EXPIRY, DISTANCE)
    private Double latitude;     // 위도 (거리순 정렬 시)
    private Double longitude;    // 경도 (거리순 정렬 시)

    public static SaleSearchCondition empty() {
        return SaleSearchCondition.builder()
                .sort(SaleSort.LATEST)
                .build();
    }
}
