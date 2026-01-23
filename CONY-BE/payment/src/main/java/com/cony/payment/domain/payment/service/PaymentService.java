package com.cony.payment.domain.payment.service;

import com.cony.payment.domain.point.service.PointService;
import com.cony.payment.infrastructure.kakaopay.client.KakaoPayClient;
import com.cony.payment.infrastructure.kakaopay.config.KakaoPayProperties;
import com.cony.payment.infrastructure.kakaopay.dto.KakaoPayApproveRequest;
import com.cony.payment.infrastructure.kakaopay.dto.KakaoPayApproveResponse;
import com.cony.payment.infrastructure.kakaopay.dto.KakaoPayReadyRequest;
import com.cony.payment.infrastructure.kakaopay.dto.KakaoPayReadyResponse;
import com.cony.payment.global.error.CustomException;
import com.cony.payment.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final KakaoPayClient kakaoPayClient;
    private final KakaoPayProperties properties;
    private final PointService pointService;

    // 임시 TID 저장소 (DB나 Redis 대용)
    private final Map<String, String> tidStorage = new ConcurrentHashMap<>();
    private final Map<String, Long> orderUserStorage = new ConcurrentHashMap<>();

    /**
     * 결제 준비
     * @param userId 사용자 ID
     * @param amount 충전 금액
     * @return 결제 준비 응답 (결제 URL 포함)
     */
    @Transactional
    public KakaoPayReadyResponse ready(Long userId, Integer amount) {
        String partnerOrderId = "ORDER_" + System.currentTimeMillis();
        String partnerUserId = String.valueOf(userId);

        log.info("카카오페이 결제 준비 요청: partner_order_id={}, amount={}", partnerOrderId, amount);

        KakaoPayReadyRequest request = KakaoPayReadyRequest.builder()
                .cid(properties.getCid())
                .partnerOrderId(partnerOrderId)
                .partnerUserId(partnerUserId)
                .itemName("포인트 " + amount + "원 충전")
                .quantity(1)
                .totalAmount(amount)
                .taxFreeAmount(amount)  // 포인트 충전은 전액 비과세
                .approvalUrl(properties.getApprovalRedirect() + "?partner_order_id=" + partnerOrderId)
                .cancelUrl(properties.getCancelRedirect())
                .failUrl(properties.getFailRedirect())
                .build();

        KakaoPayReadyResponse response = kakaoPayClient.ready(request);

        // TID 및 UserId 저장 (추후 승인 시 필요)
        tidStorage.put(partnerOrderId, response.getTid());
        orderUserStorage.put(partnerOrderId, userId);
        log.info("카카오페이 결제 준비 성공: tid={}", response.getTid());

        return response;
    }

    /**
     * 결제 승인 및 포인트 충전
     * @param pgToken 카카오페이 pg_token
     * @param partnerOrderId 주문 번호
     * @return 결제 승인 응답
     */
    @Transactional
    public KakaoPayApproveResponse payApprove(String pgToken, String partnerOrderId) {
        log.info("카카오페이 결제 승인 요청: pgToken={}, orderId={}", pgToken, partnerOrderId);

        // 1. TID 조회
        String tid = tidStorage.get(partnerOrderId);
        if (tid == null) {
            throw new CustomException(ErrorCode.TID_NOT_FOUND);
        }

        // 2. 사용자 ID 추출
        Long userId = orderUserStorage.get(partnerOrderId);
        if (userId == null) {
            throw new CustomException(ErrorCode.TID_NOT_FOUND); // 주문 정보를 찾을 수 없음
        }

        // 3. 카카오페이 승인 요청
        KakaoPayApproveRequest request = KakaoPayApproveRequest.builder()
                .cid(properties.getCid())
                .tid(tid)
                .partnerOrderId(partnerOrderId)
                .partnerUserId(String.valueOf(userId))
                .pgToken(pgToken)
                .build();

        KakaoPayApproveResponse response = kakaoPayClient.approve(request);
        log.info("카카오페이 결제 승인 성공: aid={}, amount={}", response.getAid(), response.getAmount().getTotal());

        // 4. 포인트 충전
        Long chargedAmount = Long.valueOf(response.getAmount().getTotal());
        pointService.chargePoint(userId, chargedAmount);

        // 5. 임시 저장 데이터 삭제
        tidStorage.remove(partnerOrderId);
        orderUserStorage.remove(partnerOrderId);

        return response;
    }

    /**
     * 결제 취소 처리
     */
    public void cancel(String partnerOrderId) {
        log.info("결제 취소: orderId={}", partnerOrderId);
        tidStorage.remove(partnerOrderId);
        orderUserStorage.remove(partnerOrderId);
    }

    /**
     * 결제 실패 처리
     */
    public void fail(String partnerOrderId) {
        log.info("결제 실패: orderId={}", partnerOrderId);
        tidStorage.remove(partnerOrderId);
        orderUserStorage.remove(partnerOrderId);
    }

    /**
     * TID 저장 (테스트용)
     */
    public void saveTid(String partnerOrderId, String tid) {
        tidStorage.put(partnerOrderId, tid);
    }
}