package com.cony.payment.infrastructure.kakaopay.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 카카오페이 결제 승인 응답 DTO
 */
@Getter
@NoArgsConstructor
public class KakaoPayApproveResponse {

    /**
     * 요청 고유번호
     */
    private String aid;

    /**
     * 결제 고유번호
     */
    private String tid;

    /**
     * 가맹점 코드
     */
    private String cid;

    /**
     * 정기결제 ID (정기결제인 경우)
     */
    private String sid;

    /**
     * 가맹점 주문번호
     */
    private String partner_order_id;

    /**
     * 가맹점 회원 ID
     */
    private String partner_user_id;

    /**
     * 결제 수단
     * - CARD, MONEY 등
     */
    private String payment_method_type;

    /**
     * 결제 금액 정보
     */
    private Amount amount;

    /**
     * 결제 카드 정보
     */
    private CardInfo card_info;

    /**
     * 상품명
     */
    private String item_name;

    /**
     * 상품 코드
     */
    private String item_code;

    /**
     * 상품 수량
     */
    private Integer quantity;

    /**
     * 결제 준비 요청 시각
     */
    private LocalDateTime created_at;

    /**
     * 결제 승인 시각
     */
    private LocalDateTime approved_at;

    /**
     * 결제 승인 요청에 대한 응답
     */
    private String payload;

    /**
     * 결제 금액 정보
     */
    @Getter
    @NoArgsConstructor
    public static class Amount {
        /**
         * 전체 결제 금액
         */
        private Integer total;

        /**
         * 비과세 금액
         */
        private Integer tax_free;

        /**
         * 부가세 금액
         */
        private Integer vat;

        /**
         * 사용한 포인트 금액
         */
        private Integer point;

        /**
         * 할인 금액
         */
        private Integer discount;

        /**
         * 컵 보증금
         */
        private Integer green_deposit;
    }

    /**
     * 결제 카드 정보
     */
    @Getter
    @NoArgsConstructor
    public static class CardInfo {
        /**
         * 카드사 한글명
         */
        private String kakaopay_purchase_corp;

        /**
         * 카드사 코드
         */
        private String kakaopay_purchase_corp_code;

        /**
         * 카드 발급사 한글명
         */
        private String kakaopay_issuer_corp;

        /**
         * 카드 발급사 코드
         */
        private String kakaopay_issuer_corp_code;

        /**
         * 카드 BIN
         */
        private String bin;

        /**
         * 카드 타입
         */
        private String card_type;

        /**
         * 할부 개월 수
         */
        private String install_month;

        /**
         * 카드사 승인번호
         */
        private String approved_id;

        /**
         * 카드사 가맹점 번호
         */
        private String card_mid;

        /**
         * 무이자할부 여부
         */
        private String interest_free_install;

        /**
         * 카드사 포인트 사용 금액
         */
        private Integer card_item_code;
    }
}