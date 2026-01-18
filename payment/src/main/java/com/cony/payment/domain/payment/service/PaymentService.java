package com.cony.payment.domain.payment.service;

import com.cony.payment.infrastructure.kakaopay.client.KakaoPayClient;
import com.cony.payment.infrastructure.kakaopay.dto.KakaoPayApproveRequest;
import com.cony.payment.infrastructure.kakaopay.dto.KakaoPayApproveResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final KakaoPayClient kakaoPayClient;
    // 임시 TID 저장소 (DB나 Redis 대용)
    private final Map<String, String> tidStorage = new ConcurrentHashMap<>();

    public void saveTid(String partnerOrderId, String tid) {
        tidStorage.put(partnerOrderId, tid);
    }

    public String getTid(String partnerOrderId) {
        return tidStorage.get(partnerOrderId);
    }

    public KakaoPayApproveResponse payApprove(String pgToken, String partnerOrderId) {
        String tid = getTid(partnerOrderId);
        if (tid == null) {
            throw new RuntimeException("결제 정보를 찾을 수 없습니다. orderId=" + partnerOrderId);
        }

        KakaoPayApproveRequest request = KakaoPayApproveRequest.builder()
                .cid("TC0ONETIME") // 테스트용 CID
                .tid(tid)
                .partner_order_id(partnerOrderId)
                .partner_user_id("TEST_USER_1") // KakaoPayTestController와 일치시켜야 함
                .pg_token(pgToken)
                .build();

        return kakaoPayClient.approve(request);
    }
}
