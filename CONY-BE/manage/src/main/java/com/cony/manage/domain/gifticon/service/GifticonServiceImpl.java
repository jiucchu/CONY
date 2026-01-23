package com.cony.manage.domain.gifticon.service;

import com.cony.manage.domain.gifticon.dto.*;
import com.cony.manage.domain.gifticon.entity.*;
import com.cony.manage.domain.gifticon.enums.GifticonStatus;
import com.cony.manage.domain.gifticon.enums.GifticonType;
import com.cony.manage.domain.gifticon.enums.ImageType;
import com.cony.manage.domain.gifticon.repository.*;
import com.cony.manage.domain.user.entity.User;
import com.cony.manage.domain.user.repository.UserRepository;
import com.cony.manage.global.error.CustomException;
import com.cony.manage.global.error.ErrorCode;
import com.cony.manage.infrastructure.image.FileUploader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GifticonServiceImpl implements GifticonService {
    private final GifticonRepository gifticonRepository;
    private final GifticonImageRepository gifticonImageRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final GifticonUsageLogRepository gifticonUsageLogRepository;

    private final FileUploader fileUploader;

    @Override
    public List<GifticonAnalysisResponseDto> analyzeGifticon(List<MultipartFile> images) {
        List<GifticonAnalysisResponseDto> results = new ArrayList<>();

        for(MultipartFile image : images) {
            String tempImageUrl = fileUploader.uploadTemp(image);

            // AI OCR 기능이 완성되면 RestCilent 등을 이용해 post 요청
            /*
               Map<String, Object> requestBody = Map.of(
                   "image_url", imageUrl,
                   "image_type", "ORIGINAL"
               );
               // response = restClient.post().uri("/ocr").body(requestBody)...
            */

            results.add(createMockAnalysisResult(tempImageUrl));
        }

        return results;
    }

    @Override
    @Transactional
    public List<Long> registerGifticon(List<GifticonRegisterRequestDto> requests, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        return requests.stream().map(request -> {
            if(gifticonRepository.existsByBarcodeNumber(request.getBarcodeNumber())) {
                throw new CustomException(ErrorCode.DUPLICATE_GIFTICON);
            }

            if(request.getExpiryDate().isBefore(LocalDate.now())) {
                throw new CustomException(ErrorCode.INVALID_INPUT_VALUE);
            }

            String permanentImageUrl = fileUploader.copyToPermanent(request.getImageUrl(), userId);

            Brand brand = brandRepository.findByName(request.getBrandName())
                    .orElseThrow(() -> new CustomException(ErrorCode.INVALID_INPUT_VALUE));
            Category category = brand.getCategory();

            Gifticon gifticon = Gifticon.builder()
                    .user(user)
                    .brand(brand)
                    .category(category)
                    .productName(request.getProductName())
                    .brandName(brand.getName())
                    .gifticonType(request.getType())
                    .originalPrice(request.getOriginalPrice())
                    .currentBalance(request.getOriginalPrice())
                    .expiryDate(request.getExpiryDate())
                    .barcodeNumber(request.getBarcodeNumber())
                    .status(GifticonStatus.NOT_USED)
                    .build();
            Gifticon saved = gifticonRepository.save(gifticon);

            GifticonImage gifticonImage = GifticonImage.builder()
                    .gifticon(saved)
                    .imageUrl(permanentImageUrl)
                    .imageType(ImageType.ORIGINAL)
                    .build();
            gifticonImageRepository.save(gifticonImage);

            return saved.getId();
        }).collect(Collectors.toList());
    }

    /**
     * 기프티콘 목록 조회(무한 스크롤/페이징 적용)
     * - Pageable: page(0부터), size(개수), sort(정렬) 정보를 담음
     */
    @Override
    public Page<GifticonListResponseDto> getMyGifticons(Long userId, Pageable pageable) {
        Page<Gifticon> gifticonPage = gifticonRepository.findByUserId(userId, pageable);
        if(gifticonPage.isEmpty()) {
            return Page.empty(pageable);
        }

        List<Long> gifticonIds = gifticonPage.getContent().stream()
                .map(Gifticon::getId)
                .toList();

        Map<Long, String> imageMap = gifticonImageRepository.findAllByGifticonIdIn(gifticonIds, ImageType.THUMBNAIL).stream()
                .collect(Collectors.toMap(
                        img -> img.getGifticon().getId(),
                        GifticonImage::getImageUrl,
                        (existing, replacement) -> existing
                ));

        return gifticonPage.map(g -> GifticonListResponseDto.builder()
                .gifticonId(g.getId())
                .brandName(g.getBrand().getName())
                .productName(g.getProductName())
                .barcodeNumber(g.getBarcodeNumber())
                .expiryDate(g.getExpiryDate())
                .status(g.getStatus())
                .imageUrl(imageMap.get(g.getId()))
                .build());
    }

    /**
     * 기프티콘 상세조회
     */
    @Override
    public GifticonDetailResponseDto getGifticonDetail(Long gifticonId, Long userId) {
        Gifticon gifticon = gifticonRepository.findById(gifticonId)
                .orElseThrow(() -> new CustomException(ErrorCode.GIFTICON_NOT_FOUND));

        if(!gifticon.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN_USER);
        }

        String imageUrl = gifticonImageRepository.findByGifticonIdAndImageType(gifticonId, ImageType.ORIGINAL)
                .map(GifticonImage::getImageUrl)
                .orElse(null);

        List<GifticonUsageLogResponseDto> useLogs = new ArrayList<>();
        if(gifticon.getGifticonType() == GifticonType.PREPAID) {
            useLogs = gifticonUsageLogRepository.findByGifticonIdAndIsCanceledFalseOrderByCreatedAtDesc(gifticonId).stream()
                    .map(l -> GifticonUsageLogResponseDto.builder()
                            .logId(l.getId())
                            .usedAmount(l.getUsedAmount())
                            .usedAt(l.getCreatedAt())
                            .build())
                    .toList();
        }

        return GifticonDetailResponseDto.builder()
                .gifticonId(gifticon.getId())
                .brandName(gifticon.getBrand().getName())
                .productName(gifticon.getProductName())
                .barcodeNumber(gifticon.getBarcodeNumber())
                .expiryDate(gifticon.getExpiryDate())
                .status(gifticon.getStatus())
                .originalPrice(gifticon.getOriginalPrice())
                .currentBalance(gifticon.getCurrentBalance())
                .categoryName(gifticon.getCategory().getName())
                .imageUrl(imageUrl)
                .gifticonType(gifticon.getGifticonType())
                .histories(useLogs)
                .build();
    }

    /**
     * 기프티콘 잘못 입력된 정보 수정
     */
    @Override
    @Transactional
    public Long updateGifticon(Long gifticonId, Long userId, GifticonUpdateRequestDto request) {
        Gifticon gifticon = gifticonRepository.findById(gifticonId)
                .orElseThrow(() -> new CustomException(ErrorCode.GIFTICON_NOT_FOUND));

        if(!gifticon.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN_USER);
        }

        Brand brand = brandRepository.findByName(request.getBrandName())
                .orElseThrow(() -> new CustomException(ErrorCode.INVALID_INPUT_VALUE));
        Category category = brand.getCategory();

        gifticon.updateInformation(brand, category, request.getProductName(), request.getExpiryDate(), request.getOriginalPrice());

        return gifticon.getId();
    }

    /**
     * 기프티콘 사용하기(금액권일 경우 부분 사용 가능해야함)
     */
    @Override
    @Transactional
    public Long useGifticon(Long gifticonId, Long userId, GifticonUseRequestDto request) {
        Gifticon gifticon = gifticonRepository.findById(gifticonId)
                .orElseThrow(() -> new CustomException(ErrorCode.GIFTICON_NOT_FOUND));

        if(!gifticon.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN_USER);
        }

        // 상품권이면 전액 사용, 금액권이면 프론트에서 넘어온 금액만큼 차감
        Integer amount = request.getAmount();
        if(gifticon.getGifticonType() == GifticonType.PRODUCT) {
            amount = gifticon.getOriginalPrice();
        }
        gifticon.use(amount);

        GifticonUsageLog useLog = GifticonUsageLog.builder()
                .gifticon(gifticon)
                .usedAmount(amount)
                .balanceAfterUse(gifticon.getCurrentBalance())
                .build();
        gifticonUsageLogRepository.save(useLog);

        return gifticon.getId();
    }

    /**
     * 기프티콘 사용 취소하기
     */
    @Override
    @Transactional
    public void cancelUseGifticon(Long logId, Long userId) {
        GifticonUsageLog useLog = gifticonUsageLogRepository.findById(logId)
                .orElseThrow(() -> new CustomException(ErrorCode.USING_LOG_NOT_FOUND));

        if(useLog.isCanceled()) {
            throw new CustomException(ErrorCode.ALREADY_CANCELED_LOG);
        }

        Gifticon gifticon = useLog.getGifticon();
        if(!gifticon.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN_USER);
        }

        gifticon.cancelUse(useLog.getUsedAmount());

        useLog.cancel();
    }

    /**
     * 기프티콘 사용 내역 변경하기(금액 수정)
     */
    @Override
    @Transactional
    public void updateUsageLog(Long logId, Long userId, GifticonLogUpdateRequestDto request) {
        GifticonUsageLog useLog = gifticonUsageLogRepository.findById(logId)
                .orElseThrow(() -> new CustomException(ErrorCode.USING_LOG_NOT_FOUND));

        if(useLog.isCanceled()) {
            throw new CustomException(ErrorCode.ALREADY_CANCELED_LOG);
        }

        Gifticon gifticon = useLog.getGifticon();

        if(!gifticon.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN_USER);
        }

        Integer oldAmount = useLog.getUsedAmount();
        Integer newAmount = request.getNewAmount();

        if(oldAmount.equals(newAmount)) return;

        gifticon.updateUsageAmount(oldAmount, newAmount);
        useLog.updateAmount(newAmount, gifticon.getCurrentBalance());
    }


    // --- Mock Data Generator ---
    private GifticonAnalysisResponseDto createMockAnalysisResult(String imageUrl) {
        // AI가 분석 후 "확실하다"고 판단한 데이터만 넘어온다고 가정
        GifticonAnalysisResponseDto.OcrFields fields = GifticonAnalysisResponseDto.OcrFields.builder()
                .brandName("스타벅스")
                .productName("아이스 아메리카노 T")
                .originalPrice(4500)
                .expiryDate("2025-12-31")
                .barcodeNumber("1234-5678-9012")
                .gifticonType("PRODUCT")
                .build();

        return GifticonAnalysisResponseDto.builder()
                .imageUrl(imageUrl)
                .fields(fields)
                // 신뢰성 검사 후에도 "사람의 확인이 필요하다"고 판단된 필드가 있다면 여기에 추가
                .needsReview(Collections.emptyList())
                .build();
    }
}
