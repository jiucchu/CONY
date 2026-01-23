package com.cony.payment.global.error;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    // Common
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C001", "서버 내부 오류입니다."),
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "C002", "잘못된 입력입니다."),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "C003", "지원하지 않는 HTTP 메서드입니다."),

    // Auth
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "A001", "인증되지 않은 사용자입니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "A002", "유효하지 않은 토큰입니다."),

    // User.java
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "U001", "회원을 찾을 수 없습니다."),
    DUPLICATE_EMAIL(HttpStatus.BAD_REQUEST, "U002", "이미 존재하는 이메일입니다."),

    // Point
    INSUFFICIENT_POINTS(HttpStatus.BAD_REQUEST, "P001", "포인트가 부족합니다."),
    INVALID_POINT_AMOUNT(HttpStatus.BAD_REQUEST, "P002", "포인트 금액이 올바르지 않습니다."),

    // Payment
    PAYMENT_FAILED(HttpStatus.BAD_REQUEST, "PAY001", "결제에 실패했습니다."),
    PAYMENT_CANCELLED(HttpStatus.BAD_REQUEST, "PAY002", "결제가 취소되었습니다."),
    TID_NOT_FOUND(HttpStatus.NOT_FOUND, "PAY003", "결제 정보를 찾을 수 없습니다."),
    KAKAO_PAY_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "PAY004", "카카오페이 API 오류입니다."),

    // Transaction
    TRANSACTION_NOT_FOUND(HttpStatus.NOT_FOUND, "T001", "거래 내역을 찾을 수 없습니다.");

    private final HttpStatus status;
    private final String code;          // 에러 분기용 코드
    private final String message;       // 사용자에게 보여줄 메세지
}