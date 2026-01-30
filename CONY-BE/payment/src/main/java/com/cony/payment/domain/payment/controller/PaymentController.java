package com.cony.payment.domain.payment.controller;

import com.cony.payment.domain.payment.controller.docs.PaymentControllerDocs;
import com.cony.payment.domain.payment.dto.PaymentReadyRequest;
import com.cony.payment.domain.payment.service.PaymentService;
import com.cony.payment.global.common.ApiResponse;
import com.cony.payment.infrastructure.kakaopay.dto.KakaoPayApproveResponse;
import com.cony.payment.infrastructure.kakaopay.dto.KakaoPayReadyResponse;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.io.IOException;

@Slf4j
@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController implements PaymentControllerDocs {

    private final PaymentService paymentService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    @PostMapping("/ready")
    public ApiResponse<KakaoPayReadyResponse> ready(@Valid @RequestBody PaymentReadyRequest request) {
        // 테스트 편의를 위해 userId를 1L로 하드코딩
        Long testUserId = 1L;
        log.info("결제 준비 요청 (테스트): userId={}, amount={}", testUserId, request.getAmount());

        KakaoPayReadyResponse response = paymentService.ready(testUserId, request.getAmount());

        return ApiResponse.success("결제 준비가 완료되었습니다.", response);
    }

    @Override
    @GetMapping("/approve")
    public void approve(
            @RequestParam("pg_token") String pgToken,
            @RequestParam("partner_order_id") String partnerOrderId,
            HttpServletResponse response) throws IOException {

        log.info("결제 승인 요청: pgToken={}, orderId={}", pgToken, partnerOrderId);

        try {
            KakaoPayApproveResponse approveResponse = paymentService.payApprove(pgToken, partnerOrderId);
            
            // 성공 시 프론트엔드로 리다이렉트
            String redirectUrl = frontendUrl + "/payment/success?orderId=" + partnerOrderId + "&amount=" + approveResponse.getAmount().getTotal();
            response.sendRedirect(redirectUrl);
            
        } catch (Exception e) {
            log.error("결제 승인 실패", e);
            response.sendRedirect(frontendUrl + "/payment/fail?message=" + e.getMessage());
        }
    }

    @Override
    @GetMapping("/cancel")
    public void cancel(
            @RequestParam(value = "partner_order_id", required = false) String partnerOrderId,
            HttpServletResponse response) throws IOException {
        log.info("결제 취소: orderId={}", partnerOrderId);

        if (partnerOrderId != null) {
            paymentService.cancel(partnerOrderId);
        }

        response.sendRedirect(frontendUrl + "/payment/cancel");
    }

    @Override
    @GetMapping("/fail")
    public void fail(
            @RequestParam(value = "partner_order_id", required = false) String partnerOrderId,
            HttpServletResponse response) throws IOException {
        log.info("결제 실패: orderId={}", partnerOrderId);

        if (partnerOrderId != null) {
            paymentService.fail(partnerOrderId);
        }

        response.sendRedirect(frontendUrl + "/payment/fail");
    }
}

