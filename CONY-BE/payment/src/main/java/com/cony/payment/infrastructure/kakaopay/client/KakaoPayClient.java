package com.cony.payment.infrastructure.kakaopay.client;

import com.cony.payment.infrastructure.kakaopay.config.KakaoPayProperties;
import com.cony.payment.infrastructure.kakaopay.dto.KakaoPayApproveRequest;
import com.cony.payment.infrastructure.kakaopay.dto.KakaoPayApproveResponse;
import com.cony.payment.infrastructure.kakaopay.dto.KakaoPayReadyRequest;
import com.cony.payment.infrastructure.kakaopay.dto.KakaoPayReadyResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * 카카오페이 API 호출 클라이언트
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KakaoPayClient {

    private final RestTemplate restTemplate;
    private final KakaoPayProperties kakaoPayProperties;

    /**
     * 결제 준비 API 호출
     * @param request 결제 준비 요청
     * @return 결제 준비 응답 (TID, 결제 URL 포함)
     */
    public KakaoPayReadyResponse ready(KakaoPayReadyRequest request) {
        log.info("카카오페이 결제 준비 요청: partner_order_id={}, amount={}",
                request.getPartnerOrderId(), request.getTotalAmount());

        try {
            HttpHeaders headers = createHeaders();
            HttpEntity<KakaoPayReadyRequest> entity = new HttpEntity<>(request, headers);

            KakaoPayReadyResponse response = restTemplate.postForObject(
                    kakaoPayProperties.getReadyUrl(),
                    entity,
                    KakaoPayReadyResponse.class
            );

            log.info("카카오페이 결제 준비 성공: tid={}", response.getTid());
            return response;

        } catch (Exception e) {
            log.error("카카오페이 결제 준비 실패", e);
            throw new RuntimeException("카카오페이 결제 준비 실패: " + e.getMessage(), e);
        }
    }

    /**
     * 결제 승인 API 호출
     * @param request 결제 승인 요청
     * @return 결제 승인 응답 (결제 정보 포함)
     */
    public KakaoPayApproveResponse approve(KakaoPayApproveRequest request) {
        log.info("카카오페이 결제 승인 요청: tid={}, partner_order_id={}",
                request.getTid(), request.getPartnerOrderId());

        try {
            HttpHeaders headers = createHeaders();
            HttpEntity<KakaoPayApproveRequest> entity = new HttpEntity<>(request, headers);

            KakaoPayApproveResponse response = restTemplate.postForObject(
                    kakaoPayProperties.getApproveUrl(),
                    entity,
                    KakaoPayApproveResponse.class
            );

            log.info("카카오페이 결제 승인 성공: aid={}, amount={}",
                    response.getAid(), response.getAmount().getTotal());
            return response;

        } catch (Exception e) {
            log.error("카카오페이 결제 승인 실패", e);
            throw new RuntimeException("카카오페이 결제 승인 실패: " + e.getMessage(), e);
        }
    }

    /**
     * HTTP 헤더 생성
     * - Authorization: SECRET_KEY {ADMIN_KEY}
     * - Content-Type: application/json
     */
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "SECRET_KEY " + kakaoPayProperties.getAdminKey());
        headers.set("Content-Type", "application/json");
        return headers;
    }
}