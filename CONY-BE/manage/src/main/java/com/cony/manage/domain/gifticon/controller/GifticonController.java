package com.cony.manage.domain.gifticon.controller;

import com.cony.manage.domain.gifticon.controller.docs.GifticonControllerDocs;
import com.cony.manage.domain.gifticon.dto.*;
import com.cony.manage.global.auth.annotation.AuthUser;
import com.cony.manage.domain.gifticon.service.BrandService;
import com.cony.manage.domain.gifticon.service.GifticonService;
import com.cony.manage.global.common.ApiResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

import io.swagger.v3.oas.annotations.Hidden;

@Slf4j
@RestController
@RequestMapping("/v1/gifticons")
@RequiredArgsConstructor
public class GifticonController implements GifticonControllerDocs {
    private final GifticonService gifticonService;
    private final BrandService brandService;
    private final ObjectMapper objectMapper;

    @Override
    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<List<GifticonAnalysisResponseDto>> analyzeGifticon(
            @RequestPart("images") List<MultipartFile> images) {

        return ApiResponse.success(gifticonService.analyzeGifticon(images));
    }

    // JSON으로 등록 (imageUrl 사용)
    @Override
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<List<Long>> registerGifticon(@RequestBody List<GifticonRegisterRequestDto> requests, @AuthUser Long userId) {

        return ApiResponse.success("기프티콘 등록 성공.", gifticonService.registerGifticon(requests, userId, null, null));
    }
    
    // Multipart로 등록 (실제 이미지 파일 전송)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<List<Long>> registerGifticonWithImage(
            @RequestPart(value = "requests", required = false) MultipartFile requestsPart,
            @RequestParam(value = "requests", required = false) String requestsString,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail,
             @AuthUser Long userId) {

        try {
            log.info("=== Multipart 요청 수신 ===");
            log.info("requestsPart: {}", requestsPart != null ? String.format("있음 (이름: %s, 크기: %d, Content-Type: %s)", 
                requestsPart.getName(), requestsPart.getSize(), requestsPart.getContentType()) : "없음");
            log.info("requestsString: {}", requestsString != null ? String.format("있음 (길이: %d)", requestsString.length()) : "없음");
            log.info("image 파일: {}", image != null ? String.format("있음 (이름: %s, 크기: %d, Content-Type: %s)", 
                image.getOriginalFilename(), image.getSize(), image.getContentType()) : "없음");
            log.info("thumbnail 파일: {}", thumbnail != null ? String.format("있음 (이름: %s, 크기: %d, Content-Type: %s)", 
                thumbnail.getOriginalFilename(), thumbnail.getSize(), thumbnail.getContentType()) : "없음");
            
            String jsonString = null;
            
            // requestsPart가 있으면 파일로 받은 경우
            if (requestsPart != null && !requestsPart.isEmpty()) {
                log.info("requestsPart로 받음");
                jsonString = StreamUtils.copyToString(requestsPart.getInputStream(), StandardCharsets.UTF_8);
            } 
            // requestsString이 있으면 문자열로 받은 경우 (React Native)
            else if (requestsString != null && !requestsString.trim().isEmpty()) {
                log.info("requestsString으로 받음");
                jsonString = requestsString;
            } 
            // 둘 다 없으면 에러
            else {
                log.error("requests 파트가 없습니다. requestsPart={}, requestsString={}", 
                    requestsPart != null, requestsString != null);
                throw new RuntimeException("요청 데이터가 비어있습니다.");
            }
            
            log.info("받은 JSON 문자열 (길이: {}): {}", jsonString.length(), jsonString);
            
            if (jsonString == null || jsonString.trim().isEmpty()) {
                log.error("JSON 문자열이 비어있습니다.");
                throw new RuntimeException("요청 데이터가 비어있습니다.");
            }
            
            List<GifticonRegisterRequestDto> requests = objectMapper.readValue(
                jsonString,
                new TypeReference<List<GifticonRegisterRequestDto>>() {}
            );
            
            log.info("파싱된 요청 개수: {}", requests.size());
            for (int i = 0; i < requests.size(); i++) {
                GifticonRegisterRequestDto req = requests.get(i);
                log.info("요청[{}]: brandName={}, productName={}, barcodeNumber={}, expiryDate={}, type={}, originalPrice={}, imageUrl={}",
                    i, req.getBrandName(), req.getProductName(), req.getBarcodeNumber(),
                    req.getExpiryDate(), req.getType(), req.getOriginalPrice(), req.getImageUrl());
            }
            
            return ApiResponse.success("기프티콘 등록 성공.", gifticonService.registerGifticon(requests, userId, image, thumbnail));
        } catch (com.cony.manage.global.error.CustomException e) {
            // CustomException은 그대로 전파 (GlobalExceptionHandler에서 처리)
            log.warn("CustomException 발생: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Multipart 요청 처리 오류: {}", e.getMessage(), e);
            e.printStackTrace();
            // CustomException이 아닌 경우에만 RuntimeException으로 감싸기
            throw new RuntimeException("요청 데이터 처리 실패: " + e.getMessage(), e);
        }
    }

    @Override
    @GetMapping
    public ApiResponse<Page<GifticonListResponseDto>> getMyGifticons(
            @PageableDefault(size = 20, sort = "expiryDate", direction = Sort.Direction.ASC) Pageable pageable,
            @ModelAttribute GifticonSearchCondition condition,
            @AuthUser Long userId) {
        return ApiResponse.success(gifticonService.getMyGifticons(userId, condition, pageable));
    }

    @Override
    @GetMapping("/{gifticonId}")
    public ApiResponse<GifticonDetailResponseDto> getGifticonDetail(@PathVariable Long gifticonId,
            @AuthUser Long userId) {
        return ApiResponse.success(gifticonService.getGifticonDetail(gifticonId, userId));
    }

    @Override
    @PutMapping(value = "/{gifticonId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<Long> updateGifticonInfo(@PathVariable Long gifticonId,
            @RequestBody @Valid GifticonUpdateRequestDto request, 
            @AuthUser Long userId) {

        return ApiResponse.success("잘못된 정보가 수정되었습니다.", gifticonService.updateGifticon(gifticonId, userId, request, null, null));
    }

    @PutMapping(value = "/{gifticonId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Long> updateGifticonInfoWithImage(
            @PathVariable Long gifticonId,
            @RequestPart(value = "request") @Valid GifticonUpdateRequestDto request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail, 
            @AuthUser Long userId) {

        try {
            log.info("=== 기프티콘 수정 Multipart 요청 수신 ===");
            log.info("gifticonId: {}", gifticonId);
            log.info("image 파일: {}", image != null ? String.format("있음 (이름: %s, 크기: %d, Content-Type: %s)", 
                image.getOriginalFilename(), image.getSize(), image.getContentType()) : "없음");
            log.info("thumbnail 파일: {}", thumbnail != null ? String.format("있음 (이름: %s, 크기: %d, Content-Type: %s)", 
                thumbnail.getOriginalFilename(), thumbnail.getSize(), thumbnail.getContentType()) : "없음");
            
            return ApiResponse.success("잘못된 정보가 수정되었습니다.", gifticonService.updateGifticon(gifticonId, userId, request, image, thumbnail));
        } catch (com.cony.manage.global.error.CustomException e) {
            log.warn("CustomException 발생: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("기프티콘 수정 Multipart 요청 처리 오류: {}", e.getMessage(), e);
            e.printStackTrace();
            throw new RuntimeException("요청 데이터 처리 실패: " + e.getMessage(), e);
        }
    }

    @Override
    @PostMapping("/{gifticonId}/use")
    public ApiResponse<Long> useGifticon(@PathVariable Long gifticonId, @RequestBody GifticonUseRequestDto request,
            @AuthUser Long userId) {
        return ApiResponse.success("사용이 완료되었습니다.", gifticonService.useGifticon(gifticonId, userId, request));
    }

    @Override
    @PostMapping("/{gifticonId}/cancel")
    public ApiResponse<Void> cancelUseGifticonProduct(@PathVariable Long gifticonId, @AuthUser Long userId) {
        gifticonService.cancelUseGifticon(gifticonId, userId, true);

        return ApiResponse.success("사용 이력이 취소 되었습니다");
    }

    @Override
    @PostMapping("/log/{logId}/cancel")
    public ApiResponse<Void> cancelUseGifticon(@PathVariable Long logId, @AuthUser Long userId) {
        gifticonService.cancelUseGifticon(logId, userId, false);

        return ApiResponse.success("사용 이력이 취소 되었습니다.");
    }

    @Override
    @PutMapping("/log/{logId}")
    public ApiResponse<Void> updateUseLog(@PathVariable Long logId,
            @RequestBody @Valid GifticonLogUpdateRequestDto request, @AuthUser Long userId) {
        gifticonService.updateUsageLog(logId, userId, request);

        return ApiResponse.success("사용 금액을 변경하였습니다.");
    }

    @Override
    @GetMapping("/brands")
    public ApiResponse<List<BrandResponseDto>> getBrandList(@AuthUser Long userId) {
        return ApiResponse.success(brandService.getList(userId));
    }

    /**
     * 자동판매 대상 기프티콘 조회 (알림 불필요) - 내부 서버 호출용
     * - 사용자가 직접 자동판매 설정한 기프티콘 (판매일 도래)
     * - 바로 판매중(ON_SALE) 상태로 등록됨
     */
    @Hidden
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
    @Hidden
    @GetMapping("/auto-sale/with-notification")
    public ApiResponse<List<AutoSaleTargetResponseDto>> getAutoSaleTargetsWithNotification() {
        return ApiResponse.success(gifticonService.getAutoSaleTargetsWithNotification());
    }

    /**
     * 자동판매 처리 완료 표시 - 내부 서버 호출용
     * - 판매 등록 완료 후 자동판매 설정 초기화
     */
    @Hidden
    @PostMapping("/{gifticonId}/auto-sale/processed")
    public ApiResponse<Void> markAutoSaleProcessed(@PathVariable Long gifticonId) {
        gifticonService.markAutoSaleProcessed(gifticonId);
        return ApiResponse.success("자동판매 처리가 완료되었습니다.");
    }

    /**
     * 기프티콘 정보 일괄 조회 - 내부 서버 호출용 (Payment 서버에서 판매글 목록 조회 시 사용)
     * - 인증 없이 ID 목록으로 조회 가능
     * - 판매글에 표시할 기본 정보(이미지, 상품명 등) 반환
     */
    @Hidden
    @GetMapping("/batch")
    public ApiResponse<List<GifticonResponseDto>> getGifticonsForPayment(@RequestParam("ids") List<Long> gifticonIds) {
        return ApiResponse.success(gifticonService.getGifticonsByIds(gifticonIds));
    }
}
