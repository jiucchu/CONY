package com.cony.manage.domain.user.service;

import com.cony.manage.domain.user.entity.User;
import com.cony.manage.domain.user.repository.UserRepository;
import com.cony.manage.global.auth.JwtProvider;
import com.cony.manage.global.auth.dto.TokenResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;

    @Transactional
    public TokenResponseDto reissue(String refreshToken) {
        if (!jwtProvider.validateToken(refreshToken)) {
            throw new RuntimeException("유효하지 않거나 만료된 리프레시 토큰입니다.");
        }

        String email = jwtProvider.getEmail(refreshToken);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        String newAccessToken = jwtProvider.createAccessToken(email, user.getRole().name());
        String newRefreshToken = jwtProvider.createRefreshToken(email);

        return new TokenResponseDto(newAccessToken, newRefreshToken);
    }
}
