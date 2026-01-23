package com.cony.payment.domain.transaction.enums;

/**
 * 거래 상태
 */
public enum TransactionStatus {
    PENDING,    // 대기 중
    COMPLETED,  // 완료
    FAILED,     // 실패
    CANCELLED   // 취소
}