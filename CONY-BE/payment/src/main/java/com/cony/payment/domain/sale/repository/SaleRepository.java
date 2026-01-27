package com.cony.payment.domain.sale.repository;

import com.cony.payment.domain.sale.entity.Sale;
import com.cony.payment.domain.sale.enums.SaleStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    /**
     * 비관적 락을 사용한 Sale 조회 (동시 구매 방지)
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Sale s WHERE s.id = :id")
    Optional<Sale> findByIdWithLock(@Param("id") Long id);

    /**
     * 판매 상태별 목록 조회 (최신순)
     */
    Page<Sale> findByStatusOrderByCreatedAtDesc(SaleStatus status, Pageable pageable);

    /**
     * 판매자별 판매글 목록 조회 (최신순)
     */
    Page<Sale> findBySellerIdOrderByCreatedAtDesc(Long sellerId, Pageable pageable);

    /**
     * 판매자별 + 상태별 판매글 목록 조회 (최신순)
     */
    Page<Sale> findBySellerIdAndStatusOrderByCreatedAtDesc(Long sellerId, SaleStatus status, Pageable pageable);
}