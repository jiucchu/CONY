package com.cony.payment.domain.purchase.controller;

import com.cony.payment.domain.purchase.dto.PurchaseResponseDto;
import com.cony.payment.domain.purchase.service.PurchaseService;
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
public class PurchaseController {

    private final PurchaseService purchaseService;

    /**
     * 기프티콘 구매 API
     * POST /purchases/{saleId}?userId=1
     */
    @PostMapping("/{saleId}")
    public ApiResponse<Void> purchaseGifticon(
            @RequestParam Long userId,
            @PathVariable Long saleId
    ) {
        purchaseService.purchaseGifticon(userId, saleId);
        return ApiResponse.success("기프티콘 구매가 완료되었습니다.");
    }

    /**
     * 내 구매 목록 조회 API (페이징)
     * GET /purchases/my?userId=1&page=0&size=10
     */
    @GetMapping("/my")
    public ApiResponse<Page<PurchaseResponseDto>> getMyPurchases(
            @RequestParam Long userId,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        Page<PurchaseResponseDto> purchases = purchaseService.getMyPurchases(userId, pageable);
        return ApiResponse.success("내 구매 목록을 조회했습니다.", purchases);
    }
}
