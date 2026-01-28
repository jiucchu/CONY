package com.cony.manage.global.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        // 1. API 기본 정보 설정
        Info info = new Info()
                .title("CONY Gifticon Management API")
                .version("v1.0.0")
                .description("기프티콘 관리 서비스(CONY)의 API 문서입니다.");

        // 2. JWT 인증 설정 (추후 Security 적용 시 필요)
        String jwtSchemeName = "JWT Authentication";

        // API 요청 헤더에 "Authorization: Bearer {token}"을 넣기 위한 설정
        SecurityRequirement securityRequirement = new SecurityRequirement().addList(jwtSchemeName);

        Components components = new Components()
                .addSecuritySchemes(jwtSchemeName, new SecurityScheme()
                        .name(jwtSchemeName)
                        .type(SecurityScheme.Type.HTTP) // HTTP 방식
                        .scheme("bearer")
                        .bearerFormat("JWT")); // 토큰 형식을 JWT로 지정

        // 서버 설정 (Nginx Proxy 경로 지정)
        // "Try it out" 버튼을 눌렀을 때 요청이 갈 주소를 정의합니다.
        List<Server> servers = List.of(
                new Server().url("/api/manage").description("Manage Server (Nginx)"), // 운영/개발 환경
                new Server().url("http://localhost:8080").description("Local Testing") // 로컬 환경
        );

        return new OpenAPI()
                .info(info)
                .servers(servers)
                .addSecurityItem(securityRequirement) // 모든 API에 보안 규칙 적용
                .components(components);
    }
}