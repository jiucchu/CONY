package com.cony.manage.domain.gifticon.controller.docs;

import com.cony.manage.domain.gifticon.dto.*;
import com.cony.manage.global.common.ApiResponse;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Tag(name = "Gifticon Controller", description = "기프티콘 관리 API")
public interface GifticonControllerDocs {

    @Operation(summary = "기프티콘 이미지 분석", description = "업로드된 기프티콘 이미지를 AI OCR로 분석하여 정보를 추출합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "분석 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "잘못된 요청", content = @Content),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "서버 오류", content = @Content)
    })
    ApiResponse<List<GifticonAnalysisResponseDto>> analyzeGifticon(
            @Parameter(description = "기프티콘 이미지 파일 목록", required = true) @RequestPart("images") List<MultipartFile> images
    );

    @Operation(summary = "기프티콘 등록", description = "분석된 정보를 바탕으로 기프티콘을 등록합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "등록 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "유효하지 않은 데이터", content = @Content),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "중복된 기프티콘", content = @Content)
    })
    ApiResponse<List<Long>> registerGifticon(
            @RequestBody(description = "기프티콘 등록 요청 데이터 목록", required = true) List<GifticonRegisterRequestDto> requests
    );

    @Operation(summary = "내 기프티콘 목록 조회", description = "사용자의 기프티콘 목록을 페이징하여 조회합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공")
    })
    ApiResponse<Page<GifticonListResponseDto>> getMyGifticons(
            @Parameter(description = "페이지 정보 (page, size, sort)") Pageable pageable
    );

    @Operation(summary = "기프티콘 상세 조회", description = "특정 기프티콘의 상세 정보를 조회합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "기프티콘을 찾을 수 없음", content = @Content),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "접근 권한 없음", content = @Content)
    })
    ApiResponse<GifticonDetailResponseDto> getGifticonDetail(
            @Parameter(description = "기프티콘 ID", required = true) @PathVariable Long gifticonId
    );

    @Operation(summary = "기프티콘 정보 수정", description = "기프티콘의 정보를 수정합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "수정 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "기프티콘을 찾을 수 없음", content = @Content)
    })
    ApiResponse<Long> updateGifticonInfo(
            @Parameter(description = "기프티콘 ID", required = true) @PathVariable Long gifticonId,
            @RequestBody(description = "수정할 기프티콘 정보", required = true) @Valid GifticonUpdateRequestDto request
    );

    @Operation(summary = "기프티콘 사용", description = "기프티콘을 사용 처리합니다 (금액권 포함).")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "사용 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "잔액 부족 또는 유효하지 않은 요청", content = @Content)
    })
    ApiResponse<Long> useGifticon(
            @Parameter(description = "기프티콘 ID", required = true) @PathVariable Long gifticonId,
            @RequestBody(description = "사용 요청 정보 (금액)", required = true) GifticonUseRequestDto request
    );

    @Operation(summary = "기프티콘 사용 취소", description = "기프티콘 사용 이력을 취소하고 잔액을 복구합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "취소 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "사용 이력을 찾을 수 없음", content = @Content),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "이미 취소된 이력", content = @Content)
    })
    ApiResponse<Void> cancelUseGifticon(
            @Parameter(description = "사용 이력 ID (Log ID)", required = true) @PathVariable Long logId
    );

    @Operation(summary = "기프티콘 사용 내역 수정", description = "기프티콘 사용 내역의 금액을 수정합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "수정 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "사용 이력을 찾을 수 없음", content = @Content)
    })
    ApiResponse<Void> updateUseLog(
            @Parameter(description = "사용 이력 ID (Log ID)", required = true) @PathVariable Long logId,
            @RequestBody(description = "수정할 사용 내역 정보", required = true) @Valid GifticonLogUpdateRequestDto request
    );

    @Operation(summary = "보유 기프티콘 브랜드 목록", description = "보유중인 기프티콘의 브랜드 목록을 조회합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "브랜드 목록 반환")
    })
    public ApiResponse<List<BrandResponseDto>> getBrandList();
}
