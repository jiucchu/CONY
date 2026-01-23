package com.cony.payment.domain.transaction.service;

import com.cony.payment.domain.transaction.entity.Transaction;
import com.cony.payment.domain.transaction.enums.TransactionStatus;
import com.cony.payment.domain.transaction.enums.TransactionType;
import com.cony.payment.domain.transaction.repository.TransactionRepository;
import com.cony.payment.domain.user.entity.User;
import com.cony.payment.global.error.CustomException;
import com.cony.payment.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TransactionService {

    private final TransactionRepository transactionRepository;

    /**
     * 거래 내역 생성
     * @param user 사용자
     * @param type 거래 유형
     * @param amount 거래 금액
     * @param description 거래 설명 (선택)
     * @return 생성된 거래 내역
     */
    @Transactional
    public Transaction createTransaction(User user, TransactionType type, Long amount, String description) {
        log.info("거래 내역 생성: userId={}, type={}, amount={}", user.getId(), type, amount);

        Transaction transaction = Transaction.builder()
                .user(user)
                .type(type)
                .amount(amount)
                .balanceAfter(user.getPointBalance())
                .status(TransactionStatus.COMPLETED)
                .description(description)
                .build();

        return transactionRepository.save(transaction);
    }

    /**
     * 사용자별 거래 내역 조회 (페이징)
     */
    public Page<Transaction> getTransactionsByUser(User user, Pageable pageable) {
        return transactionRepository.findByUserOrderByCreatedAtDesc(user, pageable);
    }

    /**
     * 사용자별 + 타입별 거래 내역 조회 (페이징)
     */
    public Page<Transaction> getTransactionsByUserAndType(User user, TransactionType type, Pageable pageable) {
        return transactionRepository.findByUserAndTypeOrderByCreatedAtDesc(user, type, pageable);
    }

    /**
     * 거래 내역 상세 조회
     */
    public Transaction getTransaction(Long transactionId) {
        return transactionRepository.findById(transactionId)
                .orElseThrow(() -> new CustomException(ErrorCode.TRANSACTION_NOT_FOUND));
    }

    /**
     * 사용자별 최근 거래 내역 조회 (최근 10개)
     */
    public List<Transaction> getRecentTransactions(User user) {
        return transactionRepository.findTop10ByUserOrderByCreatedAtDesc(user);
    }
}