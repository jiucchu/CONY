package com.cony.payment.domain.sale.controller;

import com.cony.payment.domain.sale.controller.docs.SaleControllerDocs;
import com.cony.payment.domain.sale.dto.SaleListResponseDto;
import com.cony.payment.domain.sale.dto.SaleRequestDto;
import com.cony.payment.domain.sale.dto.SaleSearchCondition;
import com.cony.payment.domain.sale.dto.SaleStatsDto;
import com.cony.payment.domain.sale.dto.SaleUpdateRequestDto;
import com.cony.payment.domain.sale.enums.SaleCategory;
import com.cony.payment.domain.sale.enums.SaleSort;
import com.cony.payment.domain.sale.enums.SaleStatus;
import com.cony.payment.domain.sale.service.SaleService;
import com.cony.payment.global.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sales")
@RequiredArgsConstructor
public class SaleController implements SaleControllerDocs {

    private final SaleService saleService;

    @Override
    @PostMapping
    public ApiResponse<Long> createSale(
            @RequestBody @Valid SaleRequestDto requestDto
    ) {
        Long testUserId = 1L;
        Long saleId = saleService.createSale(testUserId, requestDto);
        return ApiResponse.success("판매글이 성공적으로 등록되었습니다.", saleId);
    }

    @Override
    @GetMapping
    public ApiResponse<Page<SaleListResponseDto>> getSalesOnSale(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) SaleCategory category,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false, defaultValue = "LATEST") SaleSort sort,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        SaleSearchCondition condition = SaleSearchCondition.builder()
                .keyword(keyword)
                .category(category)
                .brand(brand)
                .sort(sort)
                .latitude(latitude)
                .longitude(longitude)
                .build();

        Page<SaleListResponseDto> sales = saleService.searchSales(condition, pageable);
        return ApiResponse.success("판매중 목록을 조회했습니다.", sales);
    }

    @Override
    @GetMapping("/brands")
    public ApiResponse<List<String>> getSaleBrands() {
        List<String> brands = saleService.getSaleBrands();
        return ApiResponse.success("브랜드 목록을 조회했습니다.", brands);
    }

    @Override
    @GetMapping("/{saleId}")
    public ApiResponse<SaleListResponseDto> getSaleDetail(@PathVariable Long saleId) {
        SaleListResponseDto sale = saleService.getSaleDetail(saleId);
        return ApiResponse.success("판매글을 조회했습니다.", sale);
    }

    @Override
    @PutMapping("/{saleId}")
    public ApiResponse<Void> updateSale(
            @PathVariable Long saleId,
            @RequestBody @Valid SaleUpdateRequestDto requestDto
    ) {
        Long testUserId = 1L;
        saleService.updateSale(testUserId, saleId, requestDto.getSalePrice());
        return ApiResponse.success("판매글이 수정되었습니다.");
    }

    @Override
    @GetMapping("/my")
    public ApiResponse<Page<SaleListResponseDto>> getMySales(
            @RequestParam(required = false) SaleStatus status,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        Long testUserId = 1L;
        Page<SaleListResponseDto> sales = saleService.getMySalesWithGifticon(testUserId, status, keyword, pageable);
        return ApiResponse.success("내 판매글 목록을 조회했습니다.", sales);
    }

    @Override
    @GetMapping("/my/stats")
    public ApiResponse<SaleStatsDto> getMySaleStats() {
        Long testUserId = 1L;
        SaleStatsDto stats = saleService.getMySaleStats(testUserId);
        return ApiResponse.success("내 판매 통계를 조회했습니다.", stats);
    }

    @Override
    @GetMapping("/my/sold")
    public ApiResponse<Page<SaleListResponseDto>> getMySoldSales(
            @PageableDefault(size = 10) Pageable pageable
    ) {
        Long testUserId = 1L;
        Page<SaleListResponseDto> sales = saleService.getMySalesWithGifticon(testUserId, SaleStatus.SOLD_OUT, null, pageable);
        return ApiResponse.success("내 판매 완료 목록을 조회했습니다.", sales);
    }

    @Override
    @DeleteMapping("/{saleId}")
    public ApiResponse<Void> cancelSale(
            @PathVariable Long saleId
    ) {
        Long testUserId = 1L;
        saleService.cancelSale(testUserId, saleId);
        return ApiResponse.success("판매가 취소되었습니다.");
    }

    @Override
    @PostMapping("/{saleId}/start")
    public ApiResponse<Void> startSale(
            @PathVariable Long saleId
    ) {
        Long testUserId = 1L;
        saleService.startSale(testUserId, saleId);
        return ApiResponse.success("판매가 시작되었습니다.");
    }

    @Override
    @GetMapping("/suggestions")
    public ApiResponse<List<SaleListResponseDto>> getSaleSuggestions() {
        Long testUserId = 1L;
        List<SaleListResponseDto> suggestions = saleService.getSaleSuggestions(testUserId);
        return ApiResponse.success("시스템 제안 목록을 조회했습니다.", suggestions);
    }
}
