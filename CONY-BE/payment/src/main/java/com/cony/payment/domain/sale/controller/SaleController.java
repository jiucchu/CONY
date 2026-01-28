package com.cony.payment.domain.sale.controller;

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
public class SaleController {

    private final SaleService saleService;

    /**
     * 판매글 등록 API
     * [POST] /sales?userId=2
     * Body: { "gifticonId": 100, "originalPrice": 6000, "salePrice": 5000 }
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
     * 판매중 목록 조회 API (검색/필터/정렬 지원)
     * [GET] /sales?keyword=스타벅스&category=CAFE&brand=스타벅스&sort=LATEST&page=0&size=10
     */
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

    /**
     * 판매중 브랜드 목록 조회 API
     * [GET] /sales/brands
     */
    @GetMapping("/brands")
    public ApiResponse<List<String>> getSaleBrands() {
        List<String> brands = saleService.getSaleBrands();
        return ApiResponse.success("브랜드 목록을 조회했습니다.", brands);
    }

    /**
     * 판매글 상세 조회 API (기프티콘 정보 포함)
     * [GET] /sales/{saleId}
     */
    @GetMapping("/{saleId}")
    public ApiResponse<SaleListResponseDto> getSaleDetail(@PathVariable Long saleId) {
        SaleListResponseDto sale = saleService.getSaleDetail(saleId);
        return ApiResponse.success("판매글을 조회했습니다.", sale);
    }

    /**
     * 판매글 수정 API (가격 변경)
     * [PUT] /sales/{saleId}?userId=1
     * Body: { "salePrice": 4500 }
     */
    @PutMapping("/{saleId}")
    public ApiResponse<Void> updateSale(
            @RequestParam Long userId,
            @PathVariable Long saleId,
            @RequestBody @Valid SaleUpdateRequestDto requestDto
    ) {
        saleService.updateSale(userId, saleId, requestDto.getSalePrice());
        return ApiResponse.success("판매글이 수정되었습니다.");
    }

    /**
     * 내 판매글 목록 조회 API (페이징, 상태별 필터, 기프티콘 정보 포함)
     * [GET] /sales/my?userId=1&status=ON_SALE&page=0&size=10
     */
    @GetMapping("/my")
    public ApiResponse<Page<SaleListResponseDto>> getMySales(
            @RequestParam Long userId,
            @RequestParam(required = false) SaleStatus status,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        Page<SaleListResponseDto> sales = saleService.getMySalesWithGifticon(userId, status, pageable);
        return ApiResponse.success("내 판매글 목록을 조회했습니다.", sales);
    }

    /**
     * 내 판매 통계 조회 API
     * [GET] /sales/my/stats?userId=1
     */
    @GetMapping("/my/stats")
    public ApiResponse<SaleStatsDto> getMySaleStats(@RequestParam Long userId) {
        SaleStatsDto stats = saleService.getMySaleStats(userId);
        return ApiResponse.success("내 판매 통계를 조회했습니다.", stats);
    }

    /**
     * 내 판매 완료 목록 조회 API (페이징, 기프티콘 정보 포함)
     * [GET] /sales/my/sold?userId=1&page=0&size=10
     */
    @GetMapping("/my/sold")
    public ApiResponse<Page<SaleListResponseDto>> getMySoldSales(
            @RequestParam Long userId,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        Page<SaleListResponseDto> sales = saleService.getMySalesWithGifticon(userId, SaleStatus.SOLD_OUT, pageable);
        return ApiResponse.success("내 판매 완료 목록을 조회했습니다.", sales);
    }

    /**
     * 판매 취소 API (판매대기/판매중 모두 가능)
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

    /**
     * 판매 시작 API (대기 -> 판매중)
     * [POST] /sales/{saleId}/start?userId=1
     */
    @PostMapping("/{saleId}/start")
    public ApiResponse<Void> startSale(
            @RequestParam Long userId,
            @PathVariable Long saleId
    ) {
        saleService.startSale(userId, saleId);
        return ApiResponse.success("판매가 시작되었습니다.");
    }
}
