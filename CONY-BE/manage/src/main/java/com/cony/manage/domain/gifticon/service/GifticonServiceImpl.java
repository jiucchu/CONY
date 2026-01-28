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
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
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
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${spring.cloud.aws.s3.bucket}")
    private String s3Bucket;

    @Override
    public List<GifticonAnalysisResponseDto> analyzeGifticon(List<MultipartFile> images) {
        List<GifticonAnalysisResponseDto> results = new ArrayList<>();

        for(MultipartFile image : images) {
            String s3Key = fileUploader.upload(image, null);

            try {
                OcrRequestDto ocrRequest = OcrRequestDto.builder()
                        .imageUrl(fileUploader.getPresignedUrl(s3Key))
                        .imageType("ORIGINAL")
                        .build();

                String responseBody = restClient.post()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(ocrRequest)
                        .exchange((request, response) -> {
                            if(response.getStatusCode().is4xxClientError() || response.getStatusCode().is5xxServerError()) {
                                throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
                            }

                            InputStream is = response.getBody();
                            byte[] bytes = is.readAllBytes();

                            return new String(bytes, StandardCharsets.UTF_8);
                        });

                JsonNode rootNode = null;
                if(responseBody != null && !responseBody.isEmpty()) {
                    rootNode = objectMapper.readTree(responseBody);
                }

                if(rootNode != null) {
                    JsonNode fields = rootNode.path("data").path("fields");

                    GifticonAnalysisResponseDto.OcrFields ocrFields = GifticonAnalysisResponseDto.OcrFields.builder()
                            .brandName(fields.path("brand_name").path("value").asText(null))
                            .productName(fields.path("product_name").path("value").asText(null))
                            .originalPrice(fields.path("original_price").path("value").asInt(0))
                            .expiryDate(fields.path("expiry_date").path("value").asText(null))
                            .gifticonType(fields.path("gifticon_type").path("value").asText(null))
                            .barcodeNumber(fields.path("barcode_number").path("value").asText(null))
                            .build();

                    List<String> needsReview = new ArrayList<>();
                    rootNode.path("data").path("needs_review").forEach(node -> needsReview.add(node.asText(null)));

                    results.add(GifticonAnalysisResponseDto.builder()
                            .imageUrl(s3Key)
                            .fields(ocrFields)
                            .needsReview(needsReview)
                            .build());
                }
            } catch (Exception e) {
                log.error("OCR Analysis failed for image: {}, error: {}", s3Key, e.getMessage());

                // 1. 모든 필드를 '검토 필요(needsReview)' 항목으로 추가
                // (프론트엔드에서 이 리스트를 보고 "아, 이 항목들을 입력받아야 하는구나"라고 판단하게 함)
                List<String> allFieldsNeeded = List.of(
                        "brandName",
                        "productName",
                        "originalPrice",
                        "expiryDate",
                        "gifticonType",
                        "barcodeNumber"
                );

                // 2. 값은 모두 비어있는(null) 필드 객체 생성
                GifticonAnalysisResponseDto.OcrFields emptyFields = GifticonAnalysisResponseDto.OcrFields.builder()
                        .build();

                // 3. 결과 리스트에 추가 (이미지 URL은 유지하여 사용자가 원본을 보고 입력할 수 있게 함)
                results.add(GifticonAnalysisResponseDto.builder()
                        .imageUrl(s3Key)
                        .fields(emptyFields)
                        .needsReview(allFieldsNeeded)
                        .build());
            }
        }

        return results;
    }

    @Override
    @Transactional
    public List<Long> registerGifticon(List<GifticonRegisterRequestDto> requests, Long userId, MultipartFile image) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        return requests.stream().map(request -> {
            if(gifticonRepository.existsByBarcodeNumber(request.getBarcodeNumber())) {
                throw new CustomException(ErrorCode.DUPLICATE_GIFTICON);
            }

            if(request.getExpiryDate().isBefore(LocalDate.now())) {
                throw new CustomException(ErrorCode.INVALID_INPUT_VALUE);
            }

            String s3Key = null;
            if(request.getImageUrl() != null) {
                s3Key = fileUploader.copyToPermanent(request.getImageUrl(), userId);
            } else if(image != null && !image.isEmpty()) {
                s3Key = fileUploader.upload(image, userId);
            }

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

            if(s3Key != null) {
                GifticonImage gifticonImage = GifticonImage.builder()
                        .gifticon(saved)
                        .imageUrl(s3Key)
                        .s3Bucket(s3Bucket)
                        .s3Key(s3Key)
                        .imageType(ImageType.ORIGINAL)
                        .build();
                gifticonImageRepository.save(gifticonImage);
            }

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
                .originalPrice(g.getOriginalPrice())
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

        String s3Key = gifticonImageRepository.findByGifticonIdAndImageType(gifticonId, ImageType.ORIGINAL)
                .map(GifticonImage::getS3Key)
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
                .imageUrl(fileUploader.getPresignedUrl(s3Key))
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
}
