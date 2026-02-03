package com.cony.manage.infrastructure.payment.client;

import com.cony.manage.global.common.ApiResponse;
import com.cony.manage.global.error.CustomException;
import com.cony.manage.global.error.ErrorCode;
import com.cony.manage.infrastructure.payment.config.PaymentServerProperties;
import com.cony.manage.infrastructure.payment.dto.OnSaleCountResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentClient {

    private final RestTemplate restTemplate;
    private final PaymentServerProperties paymentServerProperties;

    /**
     * 사용자의 판매중인 상품 개수 조회
     * @param userId 사용자 ID
     * @return 판매중 개수
     */
    public Long getOnSaleCount(Long userId) {
        String url = paymentServerProperties.getOnSaleCountUrl(userId);
        log.info("Payment 서버 판매중 개수 조회 요청: userId={}, url={}", userId, url);

        try {
            ResponseEntity<ApiResponse<OnSaleCountResponseDto>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    createHttpEntity(),
                    new ParameterizedTypeReference<ApiResponse<OnSaleCountResponseDto>>() {}
            );

            if (response.getBody() != null && response.getBody().getData() != null) {
                Long count = response.getBody().getData().getOnSaleCount();
                log.info("Payment 서버 판매중 개수 조회 성공: userId={}, count={}", userId, count);
                return count;
            }

            return 0L;

        } catch (Exception e) {
            log.error("Payment 서버 판매중 개수 조회 실패: userId={}", userId, e);
            return 0L;
        }
    }

    /**
     * 회원 탈퇴 동기화
     * @param userId 사용자 ID
     */
    public void syncUserWithdrawal(Long userId) {
        String url = paymentServerProperties.getWithdrawUrl(userId);
        log.info("Payment 서버 회원 탈퇴 동기화 요청: userId={}, url={}", userId, url);

        try {
            ResponseEntity<ApiResponse<Void>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    createHttpEntity(),
                    new ParameterizedTypeReference<ApiResponse<Void>>() {}
            );

            log.info("Payment 서버 회원 탈퇴 동기화 성공: userId={}", userId);

        } catch (Exception e) {
            log.error("Payment 서버 회원 탈퇴 동기화 실패: userId={}", userId, e);
            throw new CustomException(ErrorCode.PAYMENT_SERVER_ERROR);
        }
    }

    /**
     * 현재 요청의 Authorization 헤더를 포함한 HttpEntity 생성
     */
    private HttpEntity<?> createHttpEntity() {
        HttpHeaders headers = new HttpHeaders();
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                String authHeader = attributes.getRequest().getHeader("Authorization");
                if (authHeader != null && !authHeader.isEmpty()) {
                    headers.set("Authorization", authHeader);
                }
            }
        } catch (Exception e) {
            log.warn("Authorization 헤더 전파 중 오류 발생 (무시하고 진행): {}", e.getMessage());
        }
        return new HttpEntity<>(headers);
    }
}
