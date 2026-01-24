package com.cony.manage.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
public class RestClientConfig {

    @Value("${ocr.api.url}")
    private String ocrApiUrl;

    @Bean
    public RestClient ocrRestClient() {
        // 타임아웃 설정 (JDK Client 사용 시)
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5000); // 5초 (int, ms 단위)
        requestFactory.setReadTimeout(10000);   // 10초 (int, ms 단위)

        return RestClient.builder()
                .baseUrl(ocrApiUrl) // application.yml의 URL을 기본값으로 설정
                .requestFactory(requestFactory)
                .build();
    }
}