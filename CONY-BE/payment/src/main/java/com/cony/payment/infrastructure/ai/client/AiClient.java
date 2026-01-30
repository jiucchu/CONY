package com.cony.payment.infrastructure.ai.client;

import com.cony.payment.global.error.CustomException;
import com.cony.payment.global.error.ErrorCode;
import com.cony.payment.infrastructure.ai.config.AiServerProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * AI 서버 API 호출 클라이언트
 * - 기프티콘 이미지 분석
 * - 사기 탐지 등
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AiClient {

    private final RestTemplate restTemplate;
    private final AiServerProperties aiServerProperties;

    /**
     * AI 분석 요청 (예시)
     * 실제 AI 서버 API 스펙에 맞춰 수정 필요
     *
     * @param request 분석 요청 데이터
     * @return 분석 결과
     */
    public Map<String, Object> analyze(Map<String, Object> request) {
        String url = aiServerProperties.getAnalyzeUrl();
        log.info("AI 서버 분석 요청: url={}", url);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);

            log.info("AI 서버 분석 완료");
            return response;

        } catch (HttpClientErrorException e) {
            log.error("AI 서버 호출 실패: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);

        } catch (Exception e) {
            log.error("AI 서버 통신 오류", e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }
}
