package com.cony.payment.domain.sale.controller.docs;

import com.cony.payment.domain.sale.dto.SaleListResponseDto;
import com.cony.payment.domain.sale.dto.SaleRequestDto;
import com.cony.payment.domain.sale.dto.SaleStatsDto;
import com.cony.payment.domain.sale.dto.SaleUpdateRequestDto;
import com.cony.payment.domain.sale.enums.SaleCategory;
import com.cony.payment.domain.sale.enums.SaleSort;
import com.cony.payment.domain.sale.enums.SaleStatus;
import com.cony.payment.global.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Tag(name = "Sale", description = "판매 관리 API")
public interface SaleControllerDocs {

    @Operation(summary = "판매글 등록", description = "기프티콘 판매글을 등록합니다. scheduledSaleDate를 설정하면 자동판매(예약판매)로 등록됩니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "등록 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "잘못된 요청 (중복 판매 등)", content = @Content),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "기프티콘을 찾을 수 없음", content = @Content)
    })
    ApiResponse<Long> createSale(
            @RequestBody(required = true) @Valid SaleRequestDto requestDto
    );

    @Operation(summary = "판매중 목록 조회 (장터)", description = "판매중(ON_SALE) 상태의 상품 목록을 조회합니다. 검색, 필터, 정렬을 지원합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공")
    })
    ApiResponse<Page<SaleListResponseDto>> getSalesOnSale(
            @Parameter(description = "검색어 (브랜드명/상품명)") @RequestParam(required = false) String keyword,
            @Parameter(description = "카테고리 필터", schema = @Schema(allowableValues = {"ALL", "CAFE", "CONVENIENCE"})) @RequestParam(required = false) SaleCategory category,
            @Parameter(description = "브랜드명 필터 (정확히 일치)") @RequestParam(required = false) String brand,
            @Parameter(description = "정렬 기준", schema = @Schema(allowableValues = {"LATEST", "EXPIRY", "DISTANCE"})) @RequestParam(required = false, defaultValue = "LATEST") SaleSort sort,
            @Parameter(description = "현재 위도 (DISTANCE 정렬 시 필요)") @RequestParam(required = false) Double latitude,
            @Parameter(description = "현재 경도 (DISTANCE 정렬 시 필요)") @RequestParam(required = false) Double longitude,
            @ParameterObject Pageable pageable
    );

    @Operation(summary = "브랜드 목록 조회", description = "현재 판매중인 상품의 브랜드 목록을 조회합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공")
    })
    ApiResponse<List<String>> getSaleBrands();

    @Operation(summary = "판매글 상세 조회", description = "특정 판매글의 상세 정보를 조회합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "판매글을 찾을 수 없음", content = @Content)
    })
    ApiResponse<SaleListResponseDto> getSaleDetail(
            @Parameter(description = "판매글 ID", required = true) @PathVariable Long saleId
    );

    @Operation(summary = "판매글 수정", description = "판매가를 수정합니다. PENDING, ON_SALE 상태에서만 수정 가능합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "수정 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "본인 판매글 아님", content = @Content),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "수정 불가 상태 (SOLD_OUT)", content = @Content)
    })
    ApiResponse<Void> updateSale(
            @Parameter(description = "판매글 ID", required = true) @PathVariable Long saleId,
            @RequestBody(required = true) @Valid SaleUpdateRequestDto requestDto
    );

    @Operation(summary = "내 판매글 목록 조회", description = "내 판매글 목록을 조회합니다. 모든 상태(PENDING, ON_SALE, SOLD_OUT)를 조회할 수 있습니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공")
    })
    ApiResponse<Page<SaleListResponseDto>> getMySales(
            @Parameter(description = "상태 필터", schema = @Schema(allowableValues = {"PENDING", "ON_SALE", "SOLD_OUT"})) @RequestParam(required = false) SaleStatus status,
            @Parameter(description = "검색어 (브랜드명/상품명)") @RequestParam(required = false) String keyword,
            @ParameterObject Pageable pageable
    );

    @Operation(summary = "내 판매 통계 조회", description = "내 판매글의 상태별 개수를 조회합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공")
    })
    ApiResponse<SaleStatsDto> getMySaleStats();

    @Operation(summary = "내 판매완료 목록 조회", description = "판매완료(SOLD_OUT) 상태의 내 판매글 목록을 조회합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공")
    })
    ApiResponse<Page<SaleListResponseDto>> getMySoldSales(
            @ParameterObject Pageable pageable
    );

    @Operation(summary = "판매 취소", description = "판매글을 취소(삭제)합니다. PENDING, ON_SALE 상태에서만 취소 가능합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "취소 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "본인 판매글 아님", content = @Content),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "취소 불가 상태 (SOLD_OUT)", content = @Content)
    })
    ApiResponse<Void> cancelSale(
            @Parameter(description = "판매글 ID", required = true) @PathVariable Long saleId
    );

    @Operation(summary = "판매 시작", description = "PENDING 상태의 판매글을 수동으로 ON_SALE로 변경합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "판매 시작 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "PENDING 상태가 아님", content = @Content)
    })
    ApiResponse<Void> startSale(
            @Parameter(description = "판매글 ID", required = true) @PathVariable Long saleId
    );

    @Operation(summary = "시스템 제안 목록 조회", description = "유효기간 1달 이내이면서 아직 판매 등록되지 않은 기프티콘 목록을 조회합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공")
    })
    ApiResponse<List<SaleListResponseDto>> getSaleSuggestions();
}
