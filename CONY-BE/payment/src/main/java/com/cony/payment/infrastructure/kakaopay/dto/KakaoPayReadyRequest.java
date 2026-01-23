package com.cony.payment.infrastructure.kakaopay.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("partner_order_id")
    private String partnerOrderId;

    /**
     * 가맹점 회원 ID (필수)
     * - 최대 100자
     */
    @JsonProperty("partner_user_id")
    private String partnerUserId;

    /**
     * 상품명 (필수)
     * - 최대 100자
     */
    @JsonProperty("item_name")
    private String itemName;

    /**
     * 상품 수량 (필수)
     */
    private Integer quantity;

    /**
     * 상품 총액 (필수)
     */
    @JsonProperty("total_amount")
    private Integer totalAmount;

    /**
     * 상품 비과세 금액 (필수)
     */
    @JsonProperty("tax_free_amount")
    private Integer taxFreeAmount;

    /**
     * 결제 승인 리다이렉트 URL (필수)
     */
    @JsonProperty("approval_url")
    private String approvalUrl;

    /**
     * 결제 취소 리다이렉트 URL (필수)
     */
    @JsonProperty("cancel_url")
    private String cancelUrl;

    /**
     * 결제 실패 리다이렉트 URL (필수)
     */
    @JsonProperty("fail_url")
    private String failUrl;
}