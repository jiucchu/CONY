package com.cony.payment.domain.sale.controller;

import com.cony.payment.domain.sale.dto.SaleRequestDto;
import com.cony.payment.domain.sale.dto.SaleResponseDto;
import com.cony.payment.domain.sale.service.SaleService;
import com.cony.payment.global.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/sales")
@RequiredArgsConstructor
public class SaleController {

    private final SaleService saleService;

    /**
     * 판매글 등록 API
     * [POST] /sales?userId=2
     * Body: { "gifticonId": 100, "price": 5000 }
     */
    @PostMapping
    public ApiResponse<Long> createSale(
            @RequestParam Long userId,
            @RequestBody @Valid SaleRequestDto requestDto
    ) {
        Long saleId = saleService.createSale(userId, requestDto);
        return ApiResponse.success("판매글이 성공적으로 등록되었습니다.", saleId);
    }

    /**
     * 판매중 목록 조회 API (페이징)
     * [GET] /sales?page=0&size=10
     */
    @GetMapping
    public ApiResponse<Page<SaleResponseDto>> getSalesOnSale(
            @PageableDefault(size = 10) Pageable pageable
    ) {
        Page<SaleResponseDto> sales = saleService.getSalesOnSale(pageable);
        return ApiResponse.success("판매중 목록을 조회했습니다.", sales);
    }

    /**
     * 판매글 상세 조회 API
     * [GET] /sales/{saleId}
     */
    @GetMapping("/{saleId}")
    public ApiResponse<SaleResponseDto> getSale(@PathVariable Long saleId) {
        SaleResponseDto sale = saleService.getSale(saleId);
        return ApiResponse.success("판매글을 조회했습니다.", sale);
    }

    /**
     * 내 판매글 목록 조회 API (페이징)
     * [GET] /sales/my?userId=1&page=0&size=10
     */
    @GetMapping("/my")
    public ApiResponse<Page<SaleResponseDto>> getMySales(
            @RequestParam Long userId,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        Page<SaleResponseDto> sales = saleService.getMySales(userId, pageable);
        return ApiResponse.success("내 판매글 목록을 조회했습니다.", sales);
    }

    /**
     * 내 판매 완료 목록 조회 API (페이징)
     * [GET] /sales/my/sold?userId=1&page=0&size=10
     */
    @GetMapping("/my/sold")
    public ApiResponse<Page<SaleResponseDto>> getMySoldSales(
            @RequestParam Long userId,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        Page<SaleResponseDto> sales = saleService.getMySoldSales(userId, pageable);
        return ApiResponse.success("내 판매 완료 목록을 조회했습니다.", sales);
    }

    /**
     * 판매 취소 API
     * [DELETE] /sales/{saleId}?userId=1
     */
    @DeleteMapping("/{saleId}")
    public ApiResponse<Void> cancelSale(
            @RequestParam Long userId,
            @PathVariable Long saleId
    ) {
        saleService.cancelSale(userId, saleId);
        return ApiResponse.success("판매가 취소되었습니다.");
    }
}
