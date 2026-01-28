package com.cony.payment.domain.user.service;

import com.cony.payment.domain.sale.entity.Sale;
import com.cony.payment.domain.sale.repository.SaleRepository;
import com.cony.payment.domain.user.dto.UserInteractionLogRequestDto;
import com.cony.payment.domain.user.dto.UserInteractionLogResponseDto;
import com.cony.payment.domain.user.entity.User;
import com.cony.payment.domain.user.entity.UserInteractionLog;
import com.cony.payment.domain.user.repository.UserInteractionLogRepository;
import com.cony.payment.domain.user.repository.UserRepository;
import com.cony.payment.global.error.CustomException;
import com.cony.payment.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Method;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserInteractionLogService {

    private final UserInteractionLogRepository userInteractionLogRepository;
    private final UserRepository userRepository;
    private final SaleRepository saleRepository;


    // 행동 로그 저장
    @Transactional
    public UserInteractionLogResponseDto createInteraction(UserInteractionLogRequestDto request) {
        Long userId = getCurrentUserId();

        // 유저/세일 존재 여부 검증 (없으면 404)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        Sale sale = saleRepository.findById(request.getSaleId())
                .orElseThrow(() -> new CustomException(ErrorCode.SALE_NOT_FOUND));

        // 행동 로그 엔티티 생성 (연관관계 세팅)
        UserInteractionLog userLog = UserInteractionLog.builder()
                .user(user)
                .sale(sale)
                .eventType(request.getEventType())
                .build();

        userInteractionLogRepository.save(userLog);
        log.info("사용자 행동 로그 저장: interactionId={}, userId={}, saleId={}, eventType={}",
                userLog.getId(), userId, sale.getId(), request.getEventType());

        return UserInteractionLogResponseDto.from(userLog);
    }


    // 최근 행동 로그 30개 조회
    public List<UserInteractionLogResponseDto> getRecentInteractions() {
        Long userId = getCurrentUserId();

        return userInteractionLogRepository.findTop30ByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(UserInteractionLogResponseDto::from)
                .collect(Collectors.toList());
    }


    // 현재 로그인 유저의 userId 추출
    private Long getCurrentUserId() {
        // SecurityContextHolder에서 인증 객체를 꺼냄 (없으면 401)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }

        // principal에서 다양한 방식으로 userId 추출 시도
        Object principal = authentication.getPrincipal();
        Long userId = resolveUserIdFromPrincipal(principal);
        // principal에서 못 구하면 authentication.getName()을 Long으로 파싱
        if (userId == null) {
            userId = parseLong(authentication.getName());
        }
        // 끝까지 못 구하면 인증 실패로 처리
        if (userId == null) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }

        return userId;
    }

    private Long resolveUserIdFromPrincipal(Object principal) {
        // 익명 사용자 또는 null이면 실패 처리
        if (principal == null || Objects.equals("anonymousUser", principal)) {
            return null;
        }

        // UserDetails 구현체인 경우 username에서 userId를 파싱
        if (principal instanceof UserDetails userDetails) {
            return parseLong(userDetails.getUsername());
        }

        // principal이 문자열인 경우 그대로 파싱
        if (principal instanceof String name) {
            return parseLong(name);
        }

        // CustomUserDetails 등이 있을 수 있어 getId()/getUserId() 리플렉션 시도
        Long userId = tryInvokeIdGetter(principal, "getId");
        if (userId != null) {
            return userId;
        }

        return tryInvokeIdGetter(principal, "getUserId");
    }

    private Long tryInvokeIdGetter(Object principal, String methodName) {
        try {
            // 메서드가 있으면 호출해서 Long 또는 String을 userId로 변환
            Method method = principal.getClass().getMethod(methodName);
            Object value = method.invoke(principal);
            if (value instanceof Long) {
                return (Long) value;
            }
            if (value instanceof String) {
                return parseLong((String) value);
            }
        } catch (Exception ignored) {
            return null;
        }
        return null;
    }

    private Long parseLong(String value) {
        // null/빈 문자열은 실패 처리
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            // 공백 제거 후 Long 변환 시도
            return Long.parseLong(value.trim());
        } catch (NumberFormatException e) {
            // 숫자 형식이 아니면 실패 처리
            return null;
        }
    }
}
