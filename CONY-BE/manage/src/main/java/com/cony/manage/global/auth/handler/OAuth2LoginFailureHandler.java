package com.cony.manage.global.auth.handler;

import com.cony.manage.global.common.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2LoginFailureHandler implements AuthenticationFailureHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
                                        HttpServletResponse response,
                                        AuthenticationException exception) throws IOException {

        log.error("OAuth2 Login Failed: {}", exception.getMessage());

        response.setContentType("text/html;charset=UTF-8");
        response.setStatus(HttpServletResponse.SC_OK);

        ApiResponse<Void> apiResponse = ApiResponse.fail("소셜 로그인에 실패했습니다. 다시 시도해주세요.");
        String json = objectMapper.writeValueAsString(apiResponse);

        response.getWriter().write(
                "<html><body><script>" +
                        "  const res = " + json + ";" +
                        "  const targetWindow = window.opener || window.parent;" +
                        "  targetWindow.postMessage({ " +
                        "    type: 'OAUTH_FAILURE', " +
                        "    message: res.message " +
                        "  }, '*');" +
                        "  setTimeout(() => window.close(), 100);" +
                        "</script></body></html>"
        );

        response.getWriter().flush();
    }
}