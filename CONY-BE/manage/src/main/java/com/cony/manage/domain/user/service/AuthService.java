package com.cony.manage.domain.user.service;

import com.cony.manage.domain.user.entity.User;
import com.cony.manage.domain.user.enums.OAuthProvider;
import com.cony.manage.domain.user.enums.Role;
import com.cony.manage.domain.user.repository.UserRepository;
import com.cony.manage.global.auth.JwtProvider;
import com.cony.manage.global.auth.dto.TokenResponseDto;
import com.cony.manage.global.auth.userinfo.OAuth2UserInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;

    @Transactional
    public User saveOrUpdate(OAuth2UserInfo userInfo) {
        OAuthProvider provider = userInfo.getProvider();
        String oauthId = userInfo.getOauthId();

        User user = userRepository.findByOauthIdAndOauthProvider(oauthId, provider)
                .orElseGet(() -> userRepository.findByEmail(userInfo.getEmail()).orElse(null));

        if (user != null) {
            user.update(userInfo.getName(), userInfo.getProfileImageUrl(), oauthId, provider);
            return user;
        } else {
            return userRepository.save(User.builder()
                    .email(userInfo.getEmail())
                    .name(userInfo.getName())
                    .oauthId(oauthId)
                    .oauthProvider(provider)
                    .role(Role.USER)
                    .profileImageUrl(userInfo.getProfileImageUrl())
                    .build());
        }
    }

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
