package com.cony.payment.domain.sale.controller;

import com.cony.payment.domain.sale.controller.docs.SaleControllerDocs;
import com.cony.payment.domain.sale.dto.SaleListResponseDto;
import com.cony.payment.domain.sale.dto.SaleRequestDto;
import com.cony.payment.domain.sale.dto.SaleSearchCondition;
import com.cony.payment.domain.sale.dto.SaleStatsDto;
import com.cony.payment.domain.sale.dto.SaleUpdateRequestDto;
import com.cony.payment.domain.sale.dto.SuggestionApproveRequestDto;
import com.cony.payment.domain.sale.enums.SaleCategory;
import com.cony.payment.domain.sale.enums.SaleSort;
import com.cony.payment.domain.sale.enums.SaleStatus;
import com.cony.payment.domain.sale.service.SaleService;
import com.cony.payment.global.auth.annotation.AuthUser;
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
            @RequestBody @Valid SaleRequestDto requestDto,
            @AuthUser Long userId
    ) {
        Long saleId = saleService.createSale(userId, requestDto);
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
            @RequestBody @Valid SaleUpdateRequestDto requestDto,
            @AuthUser Long userId
    ) {
        saleService.updateSale(userId, saleId, requestDto.getSalePrice());
        return ApiResponse.success("판매글이 수정되었습니다.");
    }

    @Override
    @GetMapping("/my")
    public ApiResponse<Page<SaleListResponseDto>> getMySales(
            @RequestParam(required = false) SaleStatus status,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10) Pageable pageable,
            @AuthUser Long userId
    ) {
        Page<SaleListResponseDto> sales = saleService.getMySalesWithGifticon(userId, status, keyword, pageable);
        return ApiResponse.success("내 판매글 목록을 조회했습니다.", sales);
    }

    @Override
    @GetMapping("/my/stats")
    public ApiResponse<SaleStatsDto> getMySaleStats(@AuthUser Long userId) {
        SaleStatsDto stats = saleService.getMySaleStats(userId);
        return ApiResponse.success("내 판매 통계를 조회했습니다.", stats);
    }

    @Override
    @GetMapping("/my/sold")
    public ApiResponse<Page<SaleListResponseDto>> getMySoldSales(
            @PageableDefault(size = 10) Pageable pageable,
            @AuthUser Long userId
    ) {
        Page<SaleListResponseDto> sales = saleService.getMySalesWithGifticon(userId, SaleStatus.SOLD_OUT, null, pageable);
        return ApiResponse.success("내 판매 완료 목록을 조회했습니다.", sales);
    }

    @Override
    @DeleteMapping("/{saleId}")
    public ApiResponse<Void> cancelSale(
            @PathVariable Long saleId,
            @AuthUser Long userId
    ) {
        saleService.cancelSale(userId, saleId);
        return ApiResponse.success("판매가 취소되었습니다.");
    }

    @Override
    @PostMapping("/{saleId}/start")
    public ApiResponse<Void> startSale(
            @PathVariable Long saleId,
            @AuthUser Long userId
    ) {
        saleService.startSale(userId, saleId);
        return ApiResponse.success("판매가 시작되었습니다.");
    }

    @Override
    @GetMapping("/suggestions")
    public ApiResponse<List<SaleListResponseDto>> getSaleSuggestions(@AuthUser Long userId) {
        List<SaleListResponseDto> suggestions = saleService.getSaleSuggestions(userId);
        return ApiResponse.success("시스템 제안 목록을 조회했습니다.", suggestions);
    }

    /**
     * 시스템 제안 승인 (유효기간 임박 기프티콘 판매 등록)
     */
    @Override
    @PostMapping("/suggestions/approve")
    public ApiResponse<Long> approveSuggestion(
            @RequestBody @Valid SuggestionApproveRequestDto requestDto,
            @AuthUser Long userId
    ) {
        Long saleId = saleService.approveSuggestion(userId, requestDto.getGifticonId(), requestDto.getSalePrice());
        return ApiResponse.success("판매가 등록되었습니다.", saleId);
    }
}
