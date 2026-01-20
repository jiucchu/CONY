package com.cony.payment.infrastructure.kakaopay.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * 카카오페이 결제 승인 요청 DTO
 */
@Getter
@Builder
public class KakaoPayApproveRequest {

    /**
     * 가맹점 코드 (필수)
     */
    private String cid;

    /**
     * 결제 고유번호 (필수)
     * - 결제 준비 API 응답의 tid
     */
    private String tid;

    /**
     * 가맹점 주문번호 (필수)
     */
    private String partner_order_id;

    /**
     * 가맹점 회원 ID (필수)
     */
    private String partner_user_id;

    /**
     * 결제 승인 요청 인증 토큰 (필수)
     * - 사용자가 결제수단 선택 완료 시 받음
     */
    private String pg_token;
}