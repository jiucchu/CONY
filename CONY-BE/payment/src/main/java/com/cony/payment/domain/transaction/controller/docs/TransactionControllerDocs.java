package com.cony.payment.domain.transaction.controller.docs;

import com.cony.payment.domain.transaction.dto.TransactionResponse;
import com.cony.payment.domain.transaction.enums.TransactionType;
import com.cony.payment.global.auth.annotation.AuthUser;
import com.cony.payment.global.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Tag(name = "Transaction", description = "거래 내역 API")
public interface TransactionControllerDocs {

    @Operation(summary = "거래 내역 조회", description = "거래 내역을 페이징하여 조회합니다. 거래 유형으로 필터링할 수 있습니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공")
    })
    ApiResponse<Page<TransactionResponse>> getTransactions(
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "거래 유형 필터", schema = @Schema(allowableValues = {"CHARGE", "PURCHASE", "SALE"})) @RequestParam(required = false) TransactionType type,
            @AuthUser Long userId
    );

    @Operation(summary = "거래 상세 조회", description = "특정 거래의 상세 정보를 조회합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "거래 내역을 찾을 수 없음", content = @Content)
    })
    ApiResponse<TransactionResponse> getTransaction(
            @Parameter(description = "거래 ID", required = true) @PathVariable Long transactionId
    );

    @Operation(summary = "최근 거래 내역 조회", description = "최근 10개의 거래 내역을 조회합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공")
    })
    ApiResponse<List<TransactionResponse>> getRecentTransactions(@AuthUser Long userId);
}
