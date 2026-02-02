package com.cony.payment.domain.sale.repository;

import com.cony.payment.domain.sale.dto.SaleSearchCondition;
import com.cony.payment.domain.sale.entity.Sale;
import com.cony.payment.domain.sale.enums.SaleCategory;
import com.cony.payment.domain.sale.enums.SaleStatus;
import org.springframework.data.jpa.domain.Specification;

public class SaleSpecification {

    public static Specification<Sale> search(SaleSearchCondition condition) {
        return (root, query, builder) -> {
            Specification<Sale> spec = Specification.where(null);

            // 기본 조건: 판매중인 상품만
            spec = spec.and((root1, query1, builder1) -> 
                builder1.equal(root1.get("status"), SaleStatus.ON_SALE));

            if (condition == null) {
                return spec.toPredicate(root, query, builder);
            }

            // 브랜드 필터링 (DB 컬럼 brandId 이용)
            // 참고: condition.getBrand()는 브랜드 이름(String)으로 들어옴.
            // 하지만 DB에는 brandId(Integer)가 저장됨.
            // 프론트에서 brandId를 보내주면 좋겠지만, 현재 구조상 이름으로 검색해야 한다면
            // Manage 서버에서 브랜드 이름 -> ID 매핑 정보를 캐싱하거나,
            // 일단 기존대로 냅두고 brandId 필터링은 프론트에서 ID를 줄 때만 가능함.
            // 여기서는 일단 brandName이 들어오면 무시하고(또는 추후 개선), 
            // brandId가 condition에 추가되어야 완벽함.
            // -> 일단 현재 요구사항대로 DB 필터링을 하려면 condition에 brandId가 필요함.
            // -> 하지만 Controller에서는 String brand(이름)을 받고 있음.
            // -> 따라서 Service에서 브랜드 이름으로 Brand ID를 찾아온 뒤 여기로 넘겨야 함.
            
            // 여기서는 Specification 뼈대만 잡고 Service에서 로직 처리
            return spec.toPredicate(root, query, builder);
        };
    }
    
    public static Specification<Sale> hasStatus(SaleStatus status) {
        return (root, query, builder) -> builder.equal(root.get("status"), status);
    }
    
    public static Specification<Sale> hasBrandId(Integer brandId) {
        return (root, query, builder) -> builder.equal(root.get("brandId"), brandId);
    }
    
    public static Specification<Sale> hasSellerId(Long sellerId) {
        return (root, query, builder) -> builder.equal(root.get("sellerId"), sellerId);
    }

    public static Specification<Sale> keywordContains(String keyword) {
        // Sale 테이블에는 productName, brandName이 없음.
        // 키워드 검색은 여전히 Service 레벨이나 별도 조치가 필요함.
        // 하지만 기프티콘 정보(상품명 등)는 Manage에 있으므로 DB 쿼리로 LIKE 검색 불가능.
        // -> 키워드 검색은 DB 쿼리로 못함 (BrandId로 검색은 가능)
        return null;
    }
}
