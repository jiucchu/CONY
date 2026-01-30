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

import java.time.LocalDate;
import java.util.List;
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

    /**
     * 판매자별 + 상태별 판매글 개수 조회
     */
    long countBySellerIdAndStatus(Long sellerId, SaleStatus status);

    /**
     * 기프티콘 ID로 판매글 존재 여부 확인 (중복 등록 방지)
     */
    boolean existsByGifticonId(Long gifticonId);

    /**
     * 기프티콘 ID로 판매글 조회
     */
    Optional<Sale> findByGifticonId(Long gifticonId);

    /**
     * 판매 예정일이 도래한 PENDING Sale 목록 조회
     * - 자동판매 날짜가 오늘 이전이거나 오늘인 PENDING 상태 Sale
     */
    @Query("SELECT s FROM Sale s WHERE s.status = :status " +
           "AND s.scheduledSaleDate IS NOT NULL " +
           "AND s.scheduledSaleDate <= :today")
    List<Sale> findPendingSalesReadyToStart(
            @Param("status") SaleStatus status,
            @Param("today") LocalDate today);
}