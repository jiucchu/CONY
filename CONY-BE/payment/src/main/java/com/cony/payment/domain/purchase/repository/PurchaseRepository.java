package com.cony.payment.domain.purchase.repository;

import com.cony.payment.domain.purchase.entity.Purchase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    /**
     * 구매자별 구매 목록 조회 (최신순)
     */
    Page<Purchase> findByBuyerIdOrderByCreatedAtDesc(Long buyerId, Pageable pageable);
}