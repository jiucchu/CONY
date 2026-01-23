package com.cony.payment.infrastructure.kakaopay.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("partner_order_id")
    private String partnerOrderId;

    /**
     * 가맹점 회원 ID
     */
    @JsonProperty("partner_user_id")
    private String partnerUserId;

    /**
     * 결제 수단
     * - CARD, MONEY 등
     */
    @JsonProperty("payment_method_type")
    private String paymentMethodType;

    /**
     * 결제 금액 정보
     */
    private Amount amount;

    /**
     * 결제 카드 정보
     */
    @JsonProperty("card_info")
    private CardInfo cardInfo;

    /**
     * 상품명
     */
    @JsonProperty("item_name")
    private String itemName;

    /**
     * 상품 코드
     */
    @JsonProperty("item_code")
    private String itemCode;

    /**
     * 상품 수량
     */
    private Integer quantity;

    /**
     * 결제 준비 요청 시각
     */
    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    /**
     * 결제 승인 시각
     */
    @JsonProperty("approved_at")
    private LocalDateTime approvedAt;

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
        @JsonProperty("tax_free")
        private Integer taxFree;

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
        @JsonProperty("green_deposit")
        private Integer greenDeposit;
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
        @JsonProperty("kakaopay_purchase_corp")
        private String kakaopayPurchaseCorp;

        /**
         * 카드사 코드
         */
        @JsonProperty("kakaopay_purchase_corp_code")
        private String kakaopayPurchaseCorpCode;

        /**
         * 카드 발급사 한글명
         */
        @JsonProperty("kakaopay_issuer_corp")
        private String kakaopayIssuerCorp;

        /**
         * 카드 발급사 코드
         */
        @JsonProperty("kakaopay_issuer_corp_code")
        private String kakaopayIssuerCorpCode;

        /**
         * 카드 BIN
         */
        private String bin;

        /**
         * 카드 타입
         */
        @JsonProperty("card_type")
        private String cardType;

        /**
         * 할부 개월 수
         */
        @JsonProperty("install_month")
        private String installMonth;

        /**
         * 카드사 승인번호
         */
        @JsonProperty("approved_id")
        private String approvedId;

        /**
         * 카드사 가맹점 번호
         */
        @JsonProperty("card_mid")
        private String cardMid;

        /**
         * 무이자할부 여부
         */
        @JsonProperty("interest_free_install")
        private String interestFreeInstall;

        /**
         * 카드사 포인트 사용 금액
         */
        @JsonProperty("card_item_code")
        private Integer cardItemCode;
    }
}