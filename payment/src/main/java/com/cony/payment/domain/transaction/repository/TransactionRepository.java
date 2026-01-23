package com.cony.payment.domain.transaction.repository;

import com.cony.payment.domain.transaction.entity.Transaction;
import com.cony.payment.domain.transaction.enums.TransactionType;
import com.cony.payment.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /**
     * 사용자별 거래 내역 조회 (페이징)
     */
    Page<Transaction> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    /**
     * 사용자별 + 타입별 거래 내역 조회 (페이징)
     */
    Page<Transaction> findByUserAndTypeOrderByCreatedAtDesc(User user, TransactionType type, Pageable pageable);

    /**
     * 사용자별 거래 내역 조회 (최근 N개)
     */
    List<Transaction> findTop10ByUserOrderByCreatedAtDesc(User user);
}