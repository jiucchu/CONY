package com.cony.payment.global.config;

import com.cony.payment.domain.user.entity.User;
import com.cony.payment.domain.user.enums.UserStatus;
import com.cony.payment.domain.user.repository.UserRepository;
import com.cony.payment.global.error.CustomException;
import com.cony.payment.global.error.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.HandlerMapping;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserStatusInterceptor implements HandlerInterceptor {

    private final UserRepository userRepository;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String userIdStr = extractUserId(request);

        if (userIdStr != null) {
            try {
                Long userId = Long.parseLong(userIdStr);
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

                if (user.getStatus() != UserStatus.ACTIVE) {
                    log.warn("차단된 사용자 접근 시도: userId={}, status={}", userId, user.getStatus());
                    throw new CustomException(ErrorCode.USER_SUSPENDED);
                }
            } catch (NumberFormatException e) {
                // userId 형식이 숫자가 아닌 경우 무시 (다른 API일 수 있음)
            }
        }

        return true;
    }

    private String extractUserId(HttpServletRequest request) {
        // 1. 쿼리 파라미터에서 추출 (?userId=1)
        String userId = request.getParameter("userId");
        if (userId != null) return userId;

        // 2. 경로 변수에서 추출 (/users/{userId} 등)
        Map<String, String> pathVariables = (Map<String, String>) request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);
        if (pathVariables != null && pathVariables.containsKey("userId")) {
            return pathVariables.get("userId");
        }

        return null;
    }
}
