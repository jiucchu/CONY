package com.cony.manage.domain.gifticon.repository;

import com.cony.manage.domain.gifticon.dto.GifticonSearchCondition;
import com.cony.manage.domain.gifticon.entity.Gifticon;
import com.cony.manage.domain.gifticon.enums.GifticonStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class GifticonSpecification {
    public static Specification<Gifticon> search(Long userId, GifticonSearchCondition condition) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // WHERE user_id = ?
            predicates.add(criteriaBuilder.equal(root.get("user").get("id"), userId));

            if (Boolean.TRUE.equals(condition.getExpiringSoon())) {
                LocalDate today = LocalDate.now();
                LocalDate oneMonthLater = today.plusMonths(1);

                // AND expiry_date BETWEEN ? AND ?
                predicates.add(criteriaBuilder.between(root.get("expiryDate"), today, oneMonthLater));
            }

            if (Boolean.TRUE.equals(condition.getExcludeUsed())) {
                // AND status <> 'USED' AND expiry_date >= 오늘 (만료되지 않은 것만)
                predicates.add(criteriaBuilder.notEqual(root.get("status"), GifticonStatus.USED));
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("expiryDate"), LocalDate.now()));
            }

            if (condition.getCategoryId() != null) {
                // AND category_id = ?
                predicates.add(criteriaBuilder.equal(root.get("category").get("id"), condition.getCategoryId()));
            }

            if (condition.getBrandName() != null && !condition.getBrandName().trim().isEmpty()) {
                // AND brand.name LIKE %brandName%
                predicates.add(criteriaBuilder.like(root.get("brand").get("name"),
                        "%" + condition.getBrandName().trim() + "%"));
            }

            if (condition.getProductName() != null && !condition.getProductName().trim().isEmpty()) {
                // AND productName LIKE %productName%
                predicates.add(
                        criteriaBuilder.like(root.get("productName"), "%" + condition.getProductName().trim() + "%"));
            }

            if (condition.getNearbyBrandIds() != null) {
                if (condition.getNearbyBrandIds().isEmpty()) {
                    // 근처에 매장이 하나도 없다면 결과가 0건이어야함.
                    // => 항상 거짓인 조건 추가
                    predicates.add(criteriaBuilder.disjunction());
                } else {
                    // AND brand_id IN (...)
                    predicates.add(root.get("brand").get("id").in(condition.getNearbyBrandIds()));
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
