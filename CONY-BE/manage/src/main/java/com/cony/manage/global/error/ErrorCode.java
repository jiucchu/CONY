package com.cony.manage.global.error;

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

    // User
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "U001", "회원을 찾을 수 없습니다."),
    DUPLICATE_EMAIL(HttpStatus.BAD_REQUEST, "U002", "이미 존재하는 이메일입니다."),
    FORBIDDEN_USER(HttpStatus.FORBIDDEN, "U003", "권한이 없는 요청입니다."),

    // Gifticon
    GIFTICON_NOT_FOUND(HttpStatus.NOT_FOUND, "G001", "기프티콘을 찾을 수 없습니다."),
    DUPLICATE_GIFTICON(HttpStatus.CONFLICT, "G002", "이미 등록된 기프티콘입니다."),
    ALREADY_USED_GIFTICON(HttpStatus.CONFLICT, "G003", "이미 사용된 기프티콘입니다."),
    USING_LOG_NOT_FOUND(HttpStatus.NOT_FOUND, "G004", "사용 이력을 찾지 못했습니다."),
    ALREADY_CANCELED_LOG(HttpStatus.CONFLICT, "G005", "이미 취소된 이력입니다."),
    FAIL_FILE_UPLOAD(HttpStatus.CONFLICT, "G006", "파일 업로드에 실패하였습니다."),

    // Geofence
    INVALID_COORDINATES(HttpStatus.BAD_REQUEST, "F001", "위도, 경도 값이 잘못되었습니다.");


    // 개발중 필요한 에러가 있다면 이곳에 선언하시고 사용하면 됩니다.

    private final HttpStatus status;
    private final String code;          // 에러 분기용 코드
    private final String message;       // 사용자에게 보여줄 메세지
}
