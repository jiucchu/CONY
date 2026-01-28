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

            if(Boolean.TRUE.equals(condition.getExpiringSoon())) {
                LocalDate today = LocalDate.now();
                LocalDate oneMonthLater = today.plusMonths(1);

                // AND expiry_date BETWEEN ? AND ?
                predicates.add(criteriaBuilder.between(root.get("expiryDate"), today, oneMonthLater));
            }

            if(Boolean.TRUE.equals(condition.getExcludeUsed())) {
                // AND status <> 'USED'
                predicates.add(criteriaBuilder.notEqual(root.get("status"), GifticonStatus.USED));
            }

            if(condition.getCategoryId() != null) {
                // AND category_id = ?
                predicates.add(criteriaBuilder.equal(root.get("category").get("id"), condition.getCategoryId()));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
