package com.cony.payment.global.config;

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
                .title("CONY Payment API")
                .version("v1.0.0")
                .description("결제 및 포인트 서비스 API 문서입니다.\n\n"
                        + "### 주요 기능\n"
                        + "- **포인트**: 포인트 충전/차감/조회\n"
                        + "- **결제**: 카카오페이 결제 연동\n"
                        + "- **구매**: 기프티콘 구매 처리\n"
                        + "- **판매**: 기프티콘 판매 등록\n"
                        + "- **거래내역**: 거래 기록 조회\n"
                        + "- **신고**: 사용자 신고 처리");

        // 2. JWT 인증 설정
        String jwtSchemeName = "JWT Authentication";

        SecurityRequirement securityRequirement = new SecurityRequirement().addList(jwtSchemeName);

        Components components = new Components()
                .addSecuritySchemes(jwtSchemeName, new SecurityScheme()
                        .name(jwtSchemeName)
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT"));

        // 3. 서버 설정 (Nginx Proxy 경로 지정)
        List<Server> servers = List.of(
                new Server().url("http://i14c106.p.ssafy.io:8081/api/payment").description("Production Server"),
                new Server().url("/api/payment").description("Payment Server (Nginx)"),
                new Server().url("http://localhost:8081/api/payment").description("Local Testing")
        );

        return new OpenAPI()
                .info(info)
                .servers(servers)
                .addSecurityItem(securityRequirement)
                .components(components);
    }
}

