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
    USER_SUSPENDED(HttpStatus.FORBIDDEN, "U003", "정지된 사용자입니다."),

    // Point
    INSUFFICIENT_POINTS(HttpStatus.BAD_REQUEST, "P001", "포인트가 부족합니다."),
    INVALID_POINT_AMOUNT(HttpStatus.BAD_REQUEST, "P002", "포인트 금액이 올바르지 않습니다."),

    // Payment
    PAYMENT_FAILED(HttpStatus.BAD_REQUEST, "PAY001", "결제에 실패했습니다."),
    PAYMENT_CANCELLED(HttpStatus.BAD_REQUEST, "PAY002", "결제가 취소되었습니다."),
    TID_NOT_FOUND(HttpStatus.NOT_FOUND, "PAY003", "결제 정보를 찾을 수 없습니다."),
    KAKAO_PAY_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "PAY004", "카카오페이 API 오류입니다."),

    // Transaction
    TRANSACTION_NOT_FOUND(HttpStatus.NOT_FOUND, "T001", "거래 내역을 찾을 수 없습니다."),

    // Gifticon (Manage 서버 연동)
    GIFTICON_NOT_FOUND(HttpStatus.NOT_FOUND, "G001", "기프티콘을 찾을 수 없습니다."),
    MANAGE_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "G002", "기프티콘 서버 연동 오류입니다."),

    // Sale & Purchase
    SALE_NOT_FOUND(HttpStatus.NOT_FOUND, "S001", "판매 정보를 찾을 수 없습니다."),
    ALREADY_SOLD_OUT(HttpStatus.BAD_REQUEST, "S002", "이미 판매된 상품입니다."),
    CANNOT_BUY_OWN_PRODUCT(HttpStatus.BAD_REQUEST, "S003", "본인의 상품은 구매할 수 없습니다."),
    INVALID_SALE_STATUS(HttpStatus.BAD_REQUEST, "S004", "판매할 수 없는 상태입니다."),
    SALE_NOT_OWNED(HttpStatus.FORBIDDEN, "S005", "본인의 판매글만 취소할 수 있습니다."),
    DUPLICATE_SALE(HttpStatus.BAD_REQUEST, "S006", "이미 판매 등록된 기프티콘입니다."),

    // Report
    REPORT_NOT_FOUND(HttpStatus.NOT_FOUND, "R001", "신고 정보를 찾을 수 없습니다."),
    ALREADY_REPORTED(HttpStatus.BAD_REQUEST, "R002", "이미 신고한 판매글입니다."),
    CANNOT_REPORT_OWN_SALE(HttpStatus.BAD_REQUEST, "R003", "본인의 판매글은 신고할 수 없습니다."),
    REPORT_ALREADY_PROCESSED(HttpStatus.BAD_REQUEST, "R004", "이미 처리된 신고입니다.");

    private final HttpStatus status;
    private final String code;          // 에러 분기용 코드
    private final String message;       // 사용자에게 보여줄 메세지
}