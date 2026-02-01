package com.cony.manage.global.error;

import com.cony.manage.global.common.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. 커스텀 예외 처리
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ApiResponse<Void>> handleCustomException(CustomException e) {
        log.warn("CustomException: {}", e.getMessage());
        ErrorCode errorCode = e.getErrorCode();

        return ResponseEntity
                .status(errorCode.getStatus())
                .body(ApiResponse.fail(errorCode.getMessage()));
    }

    // 2. @Valid 유효성 검사 실패 처리
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException e) {
        BindingResult bindingResult = e.getBindingResult();
        String firstErrorMessage = bindingResult.getAllErrors().get(0).getDefaultMessage();

        log.warn("ValidationException: {}", firstErrorMessage);

        return ResponseEntity
                .status(ErrorCode.INVALID_INPUT_VALUE.getStatus())
                .body(ApiResponse.fail(firstErrorMessage));
    }

    // 3. 예상하지 못한 모든 예외 처리
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        // 전체 스택 트레이스 로깅
        log.error("Unhandled Exception 발생!", e);
        log.error("Exception Type: {}", e.getClass().getName());
        log.error("Exception Message: {}", e.getMessage());
        
        if (e.getCause() != null) {
            log.error("Caused by: {} - {}", e.getCause().getClass().getName(), e.getCause().getMessage());
            e.getCause().printStackTrace();
        }
        
        // 스택 트레이스의 첫 몇 줄도 로깅
        StackTraceElement[] stackTrace = e.getStackTrace();
        if (stackTrace.length > 0) {
            log.error("Stack trace (first 10 lines):");
            for (int i = 0; i < Math.min(10, stackTrace.length); i++) {
                log.error("  at {}", stackTrace[i]);
            }
        }

        return ResponseEntity
                .status(ErrorCode.INTERNAL_SERVER_ERROR.getStatus())
                .body(ApiResponse.error(ErrorCode.INTERNAL_SERVER_ERROR.getMessage()));
    }
}
