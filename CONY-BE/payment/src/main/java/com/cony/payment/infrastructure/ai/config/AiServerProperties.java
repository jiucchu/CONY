package com.cony.payment.infrastructure.ai.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.ai-server")
public class AiServerProperties {

    private String url;

    /**
     * AI 분석 요청 URL (OCR)
     */
    public String getAnalyzeUrl() {
        return url + "/ocr";
    }
}
