package com.cony.payment.domain.transaction.dto;

import com.cony.payment.domain.transaction.entity.Transaction;
import com.cony.payment.domain.transaction.enums.TransactionStatus;
import com.cony.payment.domain.transaction.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {

    private Long transactionId;
    private Long userId;
    private TransactionType type;
    private Long amount;
    private Long balanceAfter;
    private TransactionStatus status;
    private String description;
    private LocalDateTime createdAt;

    /**
     * Entity → DTO 변환
     */
    public static TransactionResponse from(Transaction transaction) {
        return TransactionResponse.builder()
                .transactionId(transaction.getId())
                .userId(transaction.getUser().getId())
                .type(transaction.getType())
                .amount(transaction.getAmount())
                .balanceAfter(transaction.getBalanceAfter())
                .status(transaction.getStatus())
                .description(transaction.getDescription())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}