package com.cony.payment.infrastructure.kakaopay.config;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 카카오페이 설정값 관리
 * - application.properties의 kakao.pay.* 값을 읽어옴
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "kakao.pay")
public class KakaoPayProperties {

    /**
     * 카카오페이 Admin Key
     * - 환경변수로 관리 권장: ${KAKAO_PAY_ADMIN_KEY}
     */
    private String adminKey;

    /**
     * 가맹점 코드
     * - 테스트: TC0ONETIME
     * - 운영: 실제 발급받은 CID
     */
    private String cid;

    /**
     * 결제 준비 API URL
     */
    private String readyUrl;

    /**
     * 결제 승인 API URL
     */
    private String approveUrl;

    /**
     * 결제 승인 리다이렉트 URL
     */
    private String approvalRedirect;

    /**
     * 결제 취소 리다이렉트 URL
     */
    private String cancelRedirect;

    /**
     * 결제 실패 리다이렉트 URL
     */
    private String failRedirect;
}