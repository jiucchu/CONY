package com.cony.payment.domain.purchase.controller.docs;

import com.cony.payment.domain.purchase.dto.PurchaseResponseDto;
import com.cony.payment.global.auth.annotation.AuthUser;
import com.cony.payment.global.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.PathVariable;

@Tag(name = "Purchase", description = "구매 관리 API")
public interface PurchaseControllerDocs {

    @Operation(summary = "기프티콘 구매", description = "기프티콘을 구매합니다. 포인트가 차감되고 판매자에게 포인트가 지급됩니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "구매 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "포인트 부족 / 본인 상품 구매 / 판매 불가 상태", content = @Content),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "판매글을 찾을 수 없음", content = @Content)
    })

    ApiResponse<Void> purchaseGifticon(
            @Parameter(description = "구매할 판매글 ID", required = true) @PathVariable Long saleId,
            @AuthUser Long userId
    );

    @Operation(summary = "내 구매 목록 조회", description = "내 구매 내역을 페이징하여 조회합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공")
    })
    ApiResponse<Page<PurchaseResponseDto>> getMyPurchases(
            @ParameterObject Pageable pageable,
            @AuthUser Long userId
    );
}
