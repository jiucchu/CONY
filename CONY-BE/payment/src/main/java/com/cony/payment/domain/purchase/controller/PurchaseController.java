package com.cony.payment.domain.purchase.controller;

import com.cony.payment.domain.purchase.controller.docs.PurchaseControllerDocs;
import com.cony.payment.domain.purchase.dto.PurchaseResponseDto;
import com.cony.payment.domain.purchase.service.PurchaseService;
import com.cony.payment.global.auth.annotation.AuthUser;
import com.cony.payment.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/purchases")
@RequiredArgsConstructor
public class PurchaseController implements PurchaseControllerDocs {

    private final PurchaseService purchaseService;

    @Override
    @PostMapping("/{saleId}")
    public ApiResponse<Void> purchaseGifticon(
            @PathVariable Long saleId,
            @AuthUser Long userId
    ) {
        purchaseService.purchaseGifticon(userId, saleId);
        return ApiResponse.success("기프티콘 구매가 완료되었습니다.");
    }

    @Override
    @GetMapping("/my")
    public ApiResponse<Page<PurchaseResponseDto>> getMyPurchases(
            @PageableDefault(size = 10) Pageable pageable,
            @AuthUser Long userId
    ) {
        Page<PurchaseResponseDto> purchases = purchaseService.getMyPurchases(userId, pageable);
        return ApiResponse.success("내 구매 목록을 조회했습니다.", purchases);
    }
}
