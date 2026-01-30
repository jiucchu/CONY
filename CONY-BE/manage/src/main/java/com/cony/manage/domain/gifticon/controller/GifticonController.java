package com.cony.manage.domain.gifticon.controller;

import com.cony.manage.domain.gifticon.controller.docs.GifticonControllerDocs;
import com.cony.manage.domain.gifticon.dto.*;
import com.cony.manage.domain.gifticon.service.BrandService;
import com.cony.manage.domain.gifticon.service.GifticonService;
import com.cony.manage.global.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/v1/gifticons")
@RequiredArgsConstructor
public class GifticonController implements GifticonControllerDocs {
    private final GifticonService gifticonService;
    private final BrandService brandService;

    @Override
    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<List<GifticonAnalysisResponseDto>> analyzeGifticon(@RequestPart("images") List<MultipartFile> images) {

        return ApiResponse.success(gifticonService.analyzeGifticon(images));
    }

    @Override
    @PostMapping
    public ApiResponse<List<Long>> registerGifticon(@RequestPart List<GifticonRegisterRequestDto> requests, @RequestPart(value = "image", required = false) MultipartFile image) {
        Long userId = 1L; // 추후 SecurityContextHolder 에서 추출.

        return ApiResponse.success("기프티콘 등록 성공.", gifticonService.registerGifticon(requests, userId, image));
    }

    @Override
    @GetMapping
    public ApiResponse<Page<GifticonListResponseDto>> getMyGifticons(
            @PageableDefault(size = 20, sort = "expiryDate", direction = Sort.Direction.ASC) Pageable pageable,
            @ModelAttribute GifticonSearchCondition condition) {
        Long userId = 1L; // 추후 SeurityContextHolder 에서 추출.

        return ApiResponse.success(gifticonService.getMyGifticons(userId, condition, pageable));
    }

    @Override
    @GetMapping("/{gifticonId}")
    public ApiResponse<GifticonDetailResponseDto> getGifticonDetail(@PathVariable Long gifticonId) {
        Long userId = 1L;

        return ApiResponse.success(gifticonService.getGifticonDetail(gifticonId, userId));
    }

    @Override
    @PutMapping("/{gifticonId}")
    public ApiResponse<Long> updateGifticonInfo(@PathVariable Long gifticonId, @RequestBody @Valid GifticonUpdateRequestDto request) {
        Long userId = 1L;

        return ApiResponse.success("잘못된 정보가 수정되었습니다.", gifticonService.updateGifticon(gifticonId, userId, request));
    }

    @Override
    @PostMapping("/{gifticonId}/use")
    public ApiResponse<Long> useGifticon(@PathVariable Long gifticonId, @RequestBody GifticonUseRequestDto request) {
        Long userId = 1L;

        return ApiResponse.success("사용이 완료되었습니다.", gifticonService.useGifticon(gifticonId, userId, request));
    }

    @Override
    @PostMapping("/{gifticonId}/cancel")
    public ApiResponse<Void> cancelUseGifticonProduct(@PathVariable Long gifticonId) {
        Long userId = 1L;
        gifticonService.cancelUseGifticon(gifticonId, userId, true);

        return ApiResponse.success("사용 이력이 취소 되었습니다");
    }

    @Override
    @PostMapping("/log/{logId}/cancel")
    public ApiResponse<Void> cancelUseGifticon(@PathVariable Long logId) {
        Long userId = 1L;
        gifticonService.cancelUseGifticon(logId, userId, false);

        return ApiResponse.success("사용 이력이 취소 되었습니다.");
    }

    @Override
    @PutMapping("/log/{logId}")
    public ApiResponse<Void> updateUseLog(@PathVariable Long logId, @RequestBody @Valid GifticonLogUpdateRequestDto request) {
        Long userId = 1L;
        gifticonService.updateUsageLog(logId, userId, request);

        return ApiResponse.success("사용 금액을 변경하였습니다.");
    }

    @Override
    @GetMapping("/brands")
    public ApiResponse<List<BrandResponseDto>> getBrandList() {
        Long userId = 1L;

        return ApiResponse.success(brandService.getList(userId));
    }

    /**
     * 자동판매 대상 기프티콘 조회 (알림 불필요) - 내부 서버 호출용
     * - 사용자가 직접 자동판매 설정한 기프티콘 (판매일 도래)
     * - 바로 판매중(ON_SALE) 상태로 등록됨
     */
    @GetMapping("/auto-sale/without-notification")
    public ApiResponse<List<AutoSaleTargetResponseDto>> getAutoSaleTargetsWithoutNotification() {
        return ApiResponse.success(gifticonService.getAutoSaleTargetsWithoutNotification());
    }

    /**
     * 시스템 제안 대상 기프티콘 조회 (알림 필요) - 내부 서버 호출용
     * - 유효기간 1달 이내인데 자동판매 미설정된 기프티콘
     * - "유효기간 한달 남았습니다. 지금 파시겠습니까?" 알림 발송
     * - 판매대기(PENDING) 상태로 등록됨
     */
    @GetMapping("/auto-sale/with-notification")
    public ApiResponse<List<AutoSaleTargetResponseDto>> getAutoSaleTargetsWithNotification() {
        return ApiResponse.success(gifticonService.getAutoSaleTargetsWithNotification());
    }

    /**
     * 자동판매 처리 완료 표시 - 내부 서버 호출용
     * - 판매 등록 완료 후 자동판매 설정 초기화
     */
    @PostMapping("/{gifticonId}/auto-sale/processed")
    public ApiResponse<Void> markAutoSaleProcessed(@PathVariable Long gifticonId) {
        gifticonService.markAutoSaleProcessed(gifticonId);
        return ApiResponse.success("자동판매 처리가 완료되었습니다.");
    }
}
