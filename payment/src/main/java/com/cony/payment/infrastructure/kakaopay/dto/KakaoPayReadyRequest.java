package com.cony.payment.infrastructure.kakaopay.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * 카카오페이 결제 준비 요청 DTO
 */
@Getter
@Builder
public class KakaoPayReadyRequest {

    /**
     * 가맹점 코드 (필수)
     */
    private String cid;

    /**
     * 가맹점 주문번호 (필수)
     * - 최대 100자
     */
    private String partner_order_id;

    /**
     * 가맹점 회원 ID (필수)
     * - 최대 100자
     */
    private String partner_user_id;

    /**
     * 상품명 (필수)
     * - 최대 100자
     */
    private String item_name;

    /**
     * 상품 수량 (필수)
     */
    private Integer quantity;

    /**
     * 상품 총액 (필수)
     */
    private Integer total_amount;

    /**
     * 상품 비과세 금액 (필수)
     */
    private Integer tax_free_amount;

    /**
     * 결제 승인 리다이렉트 URL (필수)
     */
    private String approval_url;

    /**
     * 결제 취소 리다이렉트 URL (필수)
     */
    private String cancel_url;

    /**
     * 결제 실패 리다이렉트 URL (필수)
     */
    private String fail_url;
}