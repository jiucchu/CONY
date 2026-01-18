package com.cony.payment.domain.payment.controller;

import com.cony.payment.domain.payment.service.PaymentService;
import com.cony.payment.infrastructure.kakaopay.dto.KakaoPayApproveResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/approve")
    public KakaoPayApproveResponse approve(@RequestParam("pg_token") String pgToken,
                                           @RequestParam("partner_order_id") String partnerOrderId) {
        return paymentService.payApprove(pgToken, partnerOrderId);
    }

    @GetMapping("/cancel")
    public String cancel() {
        return "결제가 취소되었습니다.";
    }

    @GetMapping("/fail")
    public String fail() {
        return "결제에 실패했습니다.";
    }
}
