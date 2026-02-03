package com.cony.manage.global.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        log.info(">>> [JwtFilter] 요청 들어옴: {}", requestURI);
        
        String token = resolveToken(request);
        if(token == null) {
            log.warn(">>> [JwtFilter] 토큰을 찾을 수 없음 (헤더/쿠키 확인 필요)");
        } else {
            log.info(">>> [JwtFilter] 토큰 발견됨: {}...", token.substring(0, Math.min(token.length(), 10)));

            boolean isValid = jwtProvider.validateToken(token);
            if(isValid) {
                log.info(">>> [JwtFilter] 토큰 유효함. 인증 정보 저장 시작.");
                Authentication auth = jwtProvider.getAuthentication(token);
                SecurityContextHolder.getContext().setAuthentication(auth);
                log.info(">>> [JwtFilter] SecurityContext 저장 완료: {}", auth.getName());
            } else {
                log.warn(">>> [JwtFilter] 토큰이 유효하지 않음 (validateToken == false). 만료되었거나 서명 불일치.");
            }
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");

        log.info(">>> [JwtFilter] Authorization Header: {}", authHeader);


        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("accessToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }

        return null;
    }
}
