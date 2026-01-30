package com.cony.payment.domain.payment.controller.docs;

import com.cony.payment.domain.payment.dto.PaymentReadyRequest;
import com.cony.payment.global.common.ApiResponse;
import com.cony.payment.infrastructure.kakaopay.dto.KakaoPayReadyResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.io.IOException;

@Tag(name = "Payment", description = "카카오페이 결제 API")
public interface PaymentControllerDocs {

    @Operation(summary = "결제 준비", description = "카카오페이 결제를 준비합니다. 반환된 URL로 사용자를 이동시키면 결제가 진행됩니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "결제 준비 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "카카오페이 API 오류", content = @Content)
    })
    ApiResponse<KakaoPayReadyResponse> ready(
            @RequestBody @Valid PaymentReadyRequest request
    );

    @Operation(summary = "결제 승인 (콜백)", description = "카카오페이 결제 완료 후 자동으로 호출됩니다. 포인트가 충전되고 프론트엔드로 리다이렉트됩니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "302", description = "프론트엔드로 리다이렉트")
    })
    void approve(
            @Parameter(description = "카카오페이 pg_token", required = true) @RequestParam("pg_token") String pgToken,
            @Parameter(description = "주문번호", required = true) @RequestParam("partner_order_id") String partnerOrderId,
            HttpServletResponse response
    ) throws IOException;

    @Operation(summary = "결제 취소 (콜백)", description = "사용자가 결제를 취소한 경우 호출됩니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "302", description = "프론트엔드로 리다이렉트")
    })
    void cancel(
            @Parameter(description = "주문번호") @RequestParam(value = "partner_order_id", required = false) String partnerOrderId,
            HttpServletResponse response
    ) throws IOException;

    @Operation(summary = "결제 실패 (콜백)", description = "결제가 실패한 경우 호출됩니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "302", description = "프론트엔드로 리다이렉트")
    })
    void fail(
            @Parameter(description = "주문번호") @RequestParam(value = "partner_order_id", required = false) String partnerOrderId,
            HttpServletResponse response
    ) throws IOException;
}
