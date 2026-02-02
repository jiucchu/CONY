package com.cony.payment.infrastructure.ai.client;

import com.cony.payment.global.error.CustomException;
import com.cony.payment.global.error.ErrorCode;
import com.cony.payment.infrastructure.ai.config.AiServerProperties;
import com.cony.payment.infrastructure.ai.dto.AiRecommendationRequest;
import com.cony.payment.infrastructure.ai.dto.AiRecommendationResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
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

    /**
     * 개인화 추천 요청
     *
     * @param request 사용자 로그 데이터
     * @param limit   추천 개수
     * @return 추천된 Sale ID 목록
     */
    public List<Long> getRecommendations(
            AiRecommendationRequest request, int limit) {
        String url = aiServerProperties.getUrl() + "/recommend/personal?limit=" + limit;
        log.info("AI 서버 개인화 추천 요청: url={}, logCount={}", url, request.getUserLog().size());

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<AiRecommendationRequest> entity = new HttpEntity<>(request, headers);

            // AI 서버 응답이 AiRecommendationResponse 구조임
            ResponseEntity<AiRecommendationResponse> response = restTemplate
                    .exchange(
                            url,
                            HttpMethod.POST,
                            entity,
                            AiRecommendationResponse.class);

            if (response.getBody() != null && response.getBody().getData() != null) {
                List<Long> items = response.getBody().getData().getItems();
                log.info("AI 추천 결과 수신: count={}", items != null ? items.size() : 0);
                return items != null ? items : Collections.emptyList();
            }

            return Collections.emptyList();

        } catch (Exception e) {
            log.error("AI 서버 추천 요청 실패", e);
            // 추천 실패 시 빈 리스트 반환하여 Fallback(일반 추천 등) 가능하도록 함
            return Collections.emptyList();
        }
    }
}
