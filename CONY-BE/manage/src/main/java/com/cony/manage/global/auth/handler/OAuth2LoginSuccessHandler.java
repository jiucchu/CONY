package com.cony.manage.global.auth.handler;

import com.cony.manage.domain.user.entity.User;
import com.cony.manage.domain.user.service.AuthService;
import com.cony.manage.global.auth.JwtProvider;
import com.cony.manage.global.auth.dto.TokenResponseDto;
import com.cony.manage.global.auth.userinfo.GoogleUserInfo;
import com.cony.manage.global.auth.userinfo.KakaoUserInfo;
import com.cony.manage.global.auth.userinfo.OAuth2UserInfo;
import com.cony.manage.global.common.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final AuthService authService;
    private final JwtProvider jwtProvider;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        OAuth2UserInfo userInfo = getOAuth2UserInfo(
                oauthToken.getAuthorizedClientRegistrationId(),
                oAuth2User.getAttributes());

        User user = authService.saveOrUpdate(userInfo);

        // 토큰 생성
        String accessToken = jwtProvider.createAccessToken(user.getEmail(), user.getRole().name(), user.getId());
        String refreshToken = jwtProvider.createRefreshToken(user.getEmail());

        TokenResponseDto tokenDto = new TokenResponseDto(accessToken, refreshToken);
        ApiResponse<TokenResponseDto> apiResponse = ApiResponse.success("로그인이 완료되었습니다.", tokenDto);

        response.setContentType("text/html;charset=UTF-8");
        String json = objectMapper.writeValueAsString(apiResponse);

        response.getWriter().write(
                "<html><body><script>" +
                        "  const res = " + json + ";" +
                        "  if (res.data) {" +
                        "    // React Native WebView 지원" +
                        "    if (window.ReactNativeWebView) {" +
                        "      window.ReactNativeWebView.postMessage(JSON.stringify({ " +
                        "        type: 'OAUTH_SUCCESS', " +
                        "        accessToken: res.data.accessToken, " +
                        "        refreshToken: res.data.refreshToken " +
                        "      }));" +
                        "    } else {" +
                        "      // 웹 브라우저 지원 (팝업/iframe)" +
                        "      const targetWindow = window.opener || window.parent;" +
                        "      if (targetWindow) {" +
                        "        targetWindow.postMessage({ " +
                        "          type: 'OAUTH_SUCCESS', " +
                        "          accessToken: res.data.accessToken, " +
                        "          refreshToken: res.data.refreshToken " +
                        "        }, '*');" +
                        "        setTimeout(() => window.close(), 100);" +
                        "      }" +
                        "    }" +
                        "  }" +
                        "</script></body></html>");
        response.getWriter().flush();
    }

    private OAuth2UserInfo getOAuth2UserInfo(String registrationId, Map<String, Object> attributes) {
        return switch (registrationId.toLowerCase()) {
            case "google" -> new GoogleUserInfo(attributes);
            case "kakao" -> new KakaoUserInfo(attributes);
            default -> throw new IllegalArgumentException("지원하지 않는 로그인 공급자입니다: " + registrationId);
        };
    }
}
