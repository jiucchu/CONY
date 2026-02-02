package com.cony.manage.domain.user.controller;

import com.cony.manage.domain.user.dto.FcmTokenRequestDto;
import com.cony.manage.domain.user.service.FcmTokenService;
import com.cony.manage.global.auth.annotation.AuthUser;
import com.cony.manage.global.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * FCM 토큰 관리 컨트롤러
 * 사용자의 FCM 토큰 등록 및 업데이트를 처리합니다.
 */
@RestController
@RequestMapping("/v1/users")
@RequiredArgsConstructor
public class FcmTokenController {

    private final FcmTokenService fcmTokenService;

    /**
     * FCM 토큰 등록/업데이트
     * 
     * @param request FCM 토큰 요청 DTO
     * @param userId 인증된 사용자 ID
     * @return 성공 응답
     */
    @PostMapping("/fcm-token")
    public ApiResponse<Void> registerFcmToken(
            @Valid @RequestBody FcmTokenRequestDto request,
            @AuthUser Long userId
    ) {
        fcmTokenService.updateFcmToken(userId, request.getFcmToken());
        return ApiResponse.success("FCM 토큰이 등록되었습니다.");
    }
}
