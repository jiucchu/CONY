package com.cony.payment.infrastructure.kakaopay.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 카카오페이 결제 준비 응답 DTO
 */
@Getter
@NoArgsConstructor
public class KakaoPayReadyResponse {

    /**
     * 결제 고유번호 (필수)
     * - 결제 승인 시 사용
     */
    private String tid;

    /**
     * 결제 페이지 URL (PC)
     */
    @JsonProperty("next_redirect_pc_url")
    private String nextRedirectPcUrl;

    /**
     * 결제 페이지 URL (모바일)
     */
    @JsonProperty("next_redirect_mobile_url")
    private String nextRedirectMobileUrl;

    /**
     * 결제 페이지 URL (앱)
     */
    @JsonProperty("next_redirect_app_url")
    private String nextRedirectAppUrl;

    /**
     * Android 앱 스킴
     */
    @JsonProperty("android_app_scheme")
    private String androidAppScheme;

    /**
     * iOS 앱 스킴
     */
    @JsonProperty("ios_app_scheme")
    private String iosAppScheme;

    /**
     * 생성 시간
     */
    @JsonProperty("created_at")
    private String createdAt;
}