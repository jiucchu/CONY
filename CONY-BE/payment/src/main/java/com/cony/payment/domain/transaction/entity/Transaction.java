package com.cony.payment.domain.transaction.entity;

import com.cony.payment.domain.transaction.enums.TransactionStatus;
import com.cony.payment.domain.transaction.enums.TransactionType;
import com.cony.payment.domain.user.entity.User;
import com.cony.payment.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 거래 내역 Entity
 * - 포인트 충전, 기프티콘 구매/판매 기록
 */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "transactions", indexes = {
        @Index(name = "idx_user_id", columnList = "user_id"),
        @Index(name = "idx_type", columnList = "type"),
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_created_at", columnList = "created_at"),
        @Index(name = "idx_user_type", columnList = "user_id, type")
})
public class Transaction extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @Column(nullable = false)
    private Long amount;

    @Column(nullable = false)
    private Long balanceAfter;  // 거래 후 잔액

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status;

    private String description;  // 거래 설명 (선택)

    @Builder
    public Transaction(User user, TransactionType type, Long amount, Long balanceAfter, TransactionStatus status, String description) {
        this.user = user;
        this.type = type;
        this.amount = amount;
        this.balanceAfter = balanceAfter;
        this.status = status;
        this.description = description;
    }

    /**
     * 거래 상태 변경
     */
    public void updateStatus(TransactionStatus status) {
        this.status = status;
    }
}