package com.cony.manage.global.auth.handler;

import com.cony.manage.domain.user.entity.User;
import com.cony.manage.domain.user.repository.UserRepository;
import com.cony.manage.domain.user.enums.Role;
import com.cony.manage.domain.user.enums.OAuthProvider;
import com.cony.manage.global.auth.JwtProvider;
import com.cony.manage.global.auth.userinfo.OAuth2UserInfo;
import com.cony.manage.global.auth.userinfo.GoogleUserInfo;
import com.cony.manage.global.auth.userinfo.KakaoUserInfo;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        OAuth2UserInfo userInfo = getOAuth2UserInfo(
                oauthToken.getAuthorizedClientRegistrationId(),
                oAuth2User.getAttributes()
        );

        String oauthId = userInfo.getOauthId();
        String email = userInfo.getEmail();
        String name = userInfo.getName();
        String profileImg = userInfo.getProfileImageUrl();
        OAuthProvider provider = userInfo.getProvider();

        if (oauthId == null || "null".equals(oauthId)) {
            throw new RuntimeException("OAuth2 인증 실패: 고유 식별자(ID)를 불러올 수 없습니다.");
        }

        if (email == null) {
            email = provider.name().toLowerCase() + "_" + oauthId + "@noemail.com";
        }

        final String targetEmail = email;

        User user = userRepository.findByOauthIdAndOauthProvider(oauthId, provider)
                .orElseGet(() -> userRepository.findByEmail(targetEmail).orElse(null));

        if (user != null) {
            user.update(name, profileImg, oauthId, provider);
        } else {
            user = userRepository.save(User.builder()
                    .email(email)
                    .name(name)
                    .oauthId(oauthId)
                    .oauthProvider(provider)
                    .role(Role.USER)
                    .profileImageUrl(profileImg)
                    .build());
        }

        String accessToken = jwtProvider.createAccessToken(user.getEmail(), user.getRole().name());

        String cookieValue = String.format("accessToken=%s; Path=/; HttpOnly; Max-Age=3600; SameSite=Lax", accessToken);
        response.addHeader("Set-Cookie", cookieValue);

        String targetUrl = "http://localhost:3000/";
        response.sendRedirect(targetUrl);
    }

    private OAuth2UserInfo getOAuth2UserInfo(String registrationId, Map<String, Object> attributes) {
        return switch (registrationId.toLowerCase()) {
            case "google" -> new GoogleUserInfo(attributes);
            case "kakao" -> new KakaoUserInfo(attributes);
            default -> throw new IllegalArgumentException("지원하지 않는 로그인 공급자입니다: " + registrationId);
        };
    }
}
