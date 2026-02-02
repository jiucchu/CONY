package com.cony.manage.domain.user.service;

import com.cony.manage.domain.user.entity.User;
import com.cony.manage.domain.user.repository.UserRepository;
import com.cony.manage.global.error.CustomException;
import com.cony.manage.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * FCM 토큰 관리 서비스
 * 사용자의 FCM 토큰 등록 및 업데이트를 담당합니다.
 */
@Service
@RequiredArgsConstructor
public class FcmTokenService {

    private final UserRepository userRepository;

    /**
     * 사용자의 FCM 토큰을 업데이트합니다.
     * 
     * @param userId 사용자 ID
     * @param fcmToken FCM 토큰
     * @throws IllegalArgumentException 사용자를 찾을 수 없는 경우
     */
    @Transactional
    public void updateFcmToken(Long userId, String fcmToken) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        user.updateFcmToken(fcmToken);
    }
}
