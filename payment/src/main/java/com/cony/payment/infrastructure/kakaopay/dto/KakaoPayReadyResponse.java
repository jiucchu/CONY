package com.cony.payment.infrastructure.kakaopay.dto;

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
    private String next_redirect_pc_url;

    /**
     * 결제 페이지 URL (모바일)
     */
    private String next_redirect_mobile_url;

    /**
     * 결제 페이지 URL (앱)
     */
    private String next_redirect_app_url;

    /**
     * Android 앱 스킴
     */
    private String android_app_scheme;

    /**
     * iOS 앱 스킴
     */
    private String ios_app_scheme;

    /**
     * 생성 시간
     */
    private String created_at;
}