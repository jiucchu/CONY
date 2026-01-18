package com.cony.payment.domain.payment.controller;

import com.cony.payment.infrastructure.kakaopay.client.KakaoPayClient;
import com.cony.payment.infrastructure.kakaopay.config.KakaoPayProperties;
import com.cony.payment.infrastructure.kakaopay.dto.KakaoPayReadyRequest;
import com.cony.payment.infrastructure.kakaopay.dto.KakaoPayReadyResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 카카오페이 테스트용 임시 컨트롤러
 */
@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class KakaoPayTestController {

    private final KakaoPayClient kakaoPayClient;
    private final KakaoPayProperties kakaoPayProperties;
    private final com.cony.payment.domain.payment.service.PaymentService paymentService;

    /**
     * 카카오페이 연동 테스트
     */
    @GetMapping("/kakaopay")
    public KakaoPayReadyResponse testKakaoPay() {
        String partnerOrderId = "TEST_ORDER_" + System.currentTimeMillis();

        // 1. 결제 준비 요청 생성
        KakaoPayReadyRequest request = KakaoPayReadyRequest.builder()
                .cid(kakaoPayProperties.getCid())
                .partner_order_id(partnerOrderId)
                .partner_user_id("TEST_USER_1")
                .item_name("포인트 충전 (테스트)")
                .quantity(1)
                .total_amount(10000)
                .tax_free_amount(10000)  // 포인트는 전액 비과세
                .approval_url(kakaoPayProperties.getApprovalRedirect() + "?partner_order_id=" + partnerOrderId)
                .cancel_url(kakaoPayProperties.getCancelRedirect() + "?partner_order_id=" + partnerOrderId)
                .fail_url(kakaoPayProperties.getFailRedirect() + "?partner_order_id=" + partnerOrderId)
                .build();

        // 2. 카카오페이 API 호출
        KakaoPayReadyResponse response = kakaoPayClient.ready(request);

        // 3. TID 저장 (테스트용)
        paymentService.saveTid(partnerOrderId, response.getTid());

        // 4. 응답 확인
        System.out.println("=== 카카오페이 결제 준비 성공 ===");
        System.out.println("TID: " + response.getTid());
        System.out.println("결제 URL: " + response.getNext_redirect_pc_url());

        return response;
    }
}