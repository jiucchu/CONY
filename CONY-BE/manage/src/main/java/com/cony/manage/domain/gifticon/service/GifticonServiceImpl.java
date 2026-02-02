package com.cony.manage.domain.gifticon.service;

import com.cony.manage.domain.gifticon.dto.*;
import com.cony.manage.domain.gifticon.entity.*;
import com.cony.manage.domain.gifticon.enums.GifticonStatus;
import com.cony.manage.domain.gifticon.enums.GifticonType;
import com.cony.manage.domain.gifticon.enums.ImageType;
import com.cony.manage.domain.gifticon.repository.*;
import com.cony.manage.domain.user.entity.User;
import com.cony.manage.domain.user.repository.UserRepository;
import com.cony.manage.domain.room.entity.Room;
import com.cony.manage.domain.room.entity.RoomMember;
import com.cony.manage.domain.room.enums.RoomRole;
import com.cony.manage.domain.room.repository.RoomRepository;
import com.cony.manage.domain.room.repository.RoomMemberRepository;
import com.cony.manage.global.error.CustomException;
import com.cony.manage.global.error.ErrorCode;
import com.cony.manage.infrastructure.image.FileUploader;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
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
    private final StoreGeoService storeGeoService;
    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;

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

    /**
     * 이미지 업로드 헬퍼 메서드
     */
    private String uploadImage(MultipartFile image, Long userId, String type) {
        try {
            log.info("공유 {} 이미지 파일 업로드 시작: originalFilename={}, size={}, contentType={}", 
                type, image.getOriginalFilename(), image.getSize(), image.getContentType());
            String s3Key = fileUploader.upload(image, userId);
            log.info("공유 {} 이미지 파일 업로드 완료: s3Key={}", type, s3Key);
            return s3Key;
        } catch (Exception e) {
            log.error("공유 {} 이미지 업로드 중 오류 발생: {}", type, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * 썸네일 업로드 헬퍼 메서드
     */
    private String uploadThumbnail(MultipartFile thumbnail, Long userId) {
        try {
            log.info("공유 썸네일 이미지 파일 업로드 시작: originalFilename={}, size={}, contentType={}", 
                thumbnail.getOriginalFilename(), thumbnail.getSize(), thumbnail.getContentType());
            String s3Key = fileUploader.upload(thumbnail, userId);
            log.info("공유 썸네일 이미지 파일 업로드 완료: s3Key={}", s3Key);
            return s3Key;
        } catch (Exception e) {
            log.error("공유 썸네일 이미지 업로드 중 오류 발생: {}", e.getMessage(), e);
            // 썸네일 업로드 실패해도 원본은 저장되므로 null 반환
            return null;
        }
    }

    @Override
    @Transactional
    public List<Long> registerGifticon(List<GifticonRegisterRequestDto> requests, Long userId, MultipartFile image, MultipartFile thumbnail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 이미지와 썸네일은 먼저 한 번만 업로드 (여러 쿠폰 등록 시 첫 번째 쿠폰에만 사용)
        final String sharedS3Key = (image != null && !image.isEmpty()) ? 
            uploadImage(image, userId, "원본") : null;
        
        final String sharedThumbnailS3Key = (thumbnail != null && !thumbnail.isEmpty()) ? 
            uploadThumbnail(thumbnail, userId) : null;

        // 각 쿠폰에 대해 등록 (첫 번째 쿠폰에만 이미지 연결)
        final AtomicBoolean isFirstRequest = new AtomicBoolean(true); // 첫 번째 요청인지 추적
        return requests.stream().map(request -> {
            // 필수 필드 검증
            if(request.getBrandName() == null || request.getBrandName().trim().isEmpty()) {
                log.warn("브랜드명이 없습니다.");
                throw new CustomException(ErrorCode.INVALID_INPUT_VALUE);
            }
            if(request.getProductName() == null || request.getProductName().trim().isEmpty()) {
                log.warn("상품명이 없습니다.");
                throw new CustomException(ErrorCode.INVALID_INPUT_VALUE);
            }
            if(request.getBarcodeNumber() == null || request.getBarcodeNumber().trim().isEmpty()) {
                log.warn("바코드 번호가 없습니다.");
                throw new CustomException(ErrorCode.INVALID_INPUT_VALUE);
            }
            if(request.getExpiryDate() == null) {
                log.warn("유효기간이 없습니다.");
                throw new CustomException(ErrorCode.INVALID_INPUT_VALUE);
            }
            if(request.getOriginalPrice() == null || request.getOriginalPrice() <= 0) {
                log.warn("원가가 없거나 0 이하입니다: {}", request.getOriginalPrice());
                throw new CustomException(ErrorCode.INVALID_INPUT_VALUE);
            }
            if(request.getType() == null) {
                log.warn("기프티콘 타입이 없습니다.");
                throw new CustomException(ErrorCode.INVALID_INPUT_VALUE);
            }
        
            if(request.getExpiryDate().isBefore(LocalDate.now())) {
                log.warn("과거 날짜: {}", request.getExpiryDate());
                throw new CustomException(ErrorCode.INVALID_INPUT_VALUE);
            }

            String s3Key = null;
            // 이미 업로드된 공유 이미지가 있으면 첫 번째 쿠폰에만 사용, 없으면 imageUrl 사용
            if(sharedS3Key != null && isFirstRequest.get()) {
                // 첫 번째 쿠폰에만 공유 이미지 사용
                s3Key = sharedS3Key;
                log.info("첫 번째 쿠폰에 공유 원본 이미지 사용: s3Key={}", s3Key);
                isFirstRequest.set(false); // 다음 요청부터는 이미지 사용 안 함
            } else if(request.getImageUrl() != null && !request.getImageUrl().trim().isEmpty()) {
                // imageUrl이 로컬 파일 경로가 아닌 경우에만 사용
                if(!request.getImageUrl().startsWith("file://")) {
                    log.info("이미지 URL에서 복사: {}", request.getImageUrl());
                    try {
                        s3Key = fileUploader.copyToPermanent(request.getImageUrl(), userId);
                    } catch (Exception e) {
                        log.error("이미지 URL 복사 중 오류 발생: {}", e.getMessage(), e);
                        throw e;
                    }
                } else {
                    log.warn("로컬 파일 경로는 무시됩니다: {}", request.getImageUrl());
                }
            } else {
                log.info("이미지가 없습니다. s3Key는 null로 유지됩니다.");
            }

            // 브랜드 찾기 또는 생성
            Brand brand = brandRepository.findByName(request.getBrandName())
                    .orElseGet(() -> {
                        log.info("새 브랜드 생성: {}", request.getBrandName());
                        // 카테고리 찾기 또는 생성 (기본값: "기타")
                        Category category = categoryRepository.findByName("기타")
                                .orElseGet(() -> {
                                    log.info("기본 카테고리 '기타' 생성");
                                    Category newCategory = Category.builder()
                                            .name("기타")
                                            .displayOrder(999)
                                            .build();
                                    return categoryRepository.save(newCategory);
                                });
                        
                        // 새 브랜드 생성
                        Brand newBrand = Brand.builder()
                                .name(request.getBrandName())
                                .category(category)
                                .build();
                        return brandRepository.save(newBrand);
                    });
            Category category = brand.getCategory();

            // 사용자의 기본 Room 찾기 또는 생성
            Room room = roomMemberRepository.findAllByUserId(userId).stream()
                    .findFirst()
                    .map(RoomMember::getRoom)
                    .orElseGet(() -> {
                        log.info("사용자 {}의 기본 Room 생성", userId);
                        // 기본 Room 생성
                        Room defaultRoom = Room.builder()
                                .name(user.getName() + "의 쿠폰함")
                                .roomCode(java.util.UUID.randomUUID().toString().substring(0, 8))
                                .maxMembers(10)
                                .owner(user)
                                .build();
                        Room savedRoom = roomRepository.save(defaultRoom);
                        
                        // RoomMember 생성
                        RoomMember roomMember = RoomMember.builder()
                                .room(savedRoom)
                                .user(user)
                                .role(RoomRole.OWNER)
                                .build();
                        roomMemberRepository.save(roomMember);
                        
                        return savedRoom;
                    });

            Gifticon gifticon = Gifticon.builder()
                    .user(user)
                    .brand(brand)
                    .category(category)
                    .room(room)
                    .productName(request.getProductName())
                    .brandName(brand.getName())
                    .gifticonType(request.getType())
                    .originalPrice(request.getOriginalPrice())
                    .currentBalance(request.getOriginalPrice())
                    .expiryDate(request.getExpiryDate())
                    .barcodeNumber(request.getBarcodeNumber())
                    .status(GifticonStatus.NOT_USED)
                    // 자동판매 설정
                    .scheduledSaleDate(request.getScheduledSaleDate())
                    .plannedSalePrice(request.getPlannedSalePrice())
                    .build();
            Gifticon saved = gifticonRepository.save(gifticon);

            // 원본 이미지 저장
            if(s3Key != null) {
                GifticonImage gifticonImage = GifticonImage.builder()
                        .gifticon(saved)
                        .imageUrl(s3Key)
                        .s3Bucket(s3Bucket)
                        .s3Key(s3Key)
                        .imageType(ImageType.ORIGINAL)
                        .build();
                gifticonImageRepository.save(gifticonImage);
                log.info("원본 이미지 저장 완료: gifticonId={}, s3Key={}", saved.getId(), s3Key);
            } else {
                log.warn("원본 이미지가 저장되지 않음: gifticonId={}", saved.getId());
            }

            // 썸네일 이미지 저장 (이미 업로드된 공유 썸네일 사용 - 첫 번째 쿠폰에만)
            // sharedS3Key를 사용한 경우에만 썸네일도 사용 (첫 번째 쿠폰)
            boolean useThumbnail = (sharedS3Key != null && sharedS3Key.equals(s3Key));
            if(sharedThumbnailS3Key != null && useThumbnail) {
                // 첫 번째 쿠폰에만 공유 썸네일 사용
                try {
                    log.info("첫 번째 쿠폰에 공유 썸네일 이미지 사용: s3Key={}", sharedThumbnailS3Key);
                    GifticonImage thumbnailImage = GifticonImage.builder()
                            .gifticon(saved)
                            .imageUrl(sharedThumbnailS3Key)
                            .s3Bucket(s3Bucket)
                            .s3Key(sharedThumbnailS3Key)
                            .imageType(ImageType.THUMBNAIL)
                            .build();
                    gifticonImageRepository.save(thumbnailImage);
                    log.info("썸네일 이미지 저장 완료: gifticonId={}, s3Key={}", saved.getId(), sharedThumbnailS3Key);
                } catch (Exception e) {
                    log.error("썸네일 이미지 저장 중 오류 발생: {}", e.getMessage(), e);
                    // 썸네일 저장 실패해도 원본은 저장되므로 계속 진행
                }
            }

            return saved.getId();
        }).collect(Collectors.toList());
    }

    /**
     * 기프티콘 목록 조회(무한 스크롤/페이징 적용)
     * - Pageable: page(0부터), size(개수), sort(정렬) 정보를 담음
     */
    @Override
    public Page<GifticonListResponseDto> getMyGifticons(Long userId, GifticonSearchCondition condition, Pageable pageable) {

        // [위치 기반 필터링]
        if(condition.getLatitude() != null && condition.getLongitude() != null) {
            int radius = (condition.getRadius() != null) ? condition.getRadius().intValue() : 1000;
            List<Long> nearbyBrands = storeGeoService.getNearbyBrandIds(condition.getLatitude(), condition.getLongitude(), radius);
            condition.setNearbyBrandIds(nearbyBrands);
        }

        // 사용완료 된 기프티콘을 보여준다면 => 미사용, 사용중 기프티콘이 먼저 나오도록 함.
        if(!Boolean.TRUE.equals(condition.getExcludeUsed())) {
            Sort statusSort = Sort.by(Sort.Order.asc("statusOrder"));

            Sort finalSort = statusSort.and(pageable.getSort());

            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), finalSort);
        }

        Specification<Gifticon> specification = GifticonSpecification.search(userId, condition);

        Page<Gifticon> gifticonPage = gifticonRepository.findAll(specification, pageable);
        if(gifticonPage.isEmpty()) {
            return Page.empty(pageable);
        }

        List<Long> gifticonIds = gifticonPage.getContent().stream()
                .map(Gifticon::getId)
                .toList();

        // THUMBNAIL 이미지 먼저 조회
        Map<Long, String> imageMap = gifticonImageRepository.findAllByGifticonIdIn(gifticonIds, ImageType.THUMBNAIL).stream()
                .filter(img -> img.getS3Key() != null && !img.getS3Key().isEmpty())
                .collect(Collectors.toMap(
                        img -> img.getGifticon().getId(),
                        img -> fileUploader.getPresignedUrl(img.getS3Key()),
                        (existing, replacement) -> existing
                ));

        return gifticonPage.map(g -> GifticonListResponseDto.builder()
                .gifticonId(g.getId())
                .brandName(g.getBrand().getName())
                .productName(g.getProductName())
                .barcodeNumber(g.getBarcodeNumber())
                .expiryDate(g.getExpiryDate())
                .status(g.getStatus())
                .imageUrl(imageMap.getOrDefault(g.getId(), null))
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
                .scheduledSaleDate(gifticon.getScheduledSaleDate())
                .plannedSalePrice(gifticon.getPlannedSalePrice())
                .histories(useLogs)
                .build();
    }

    /**
     * 기프티콘 잘못 입력된 정보 수정
     */
    @Override
    @Transactional
    public Long updateGifticon(Long gifticonId, Long userId, GifticonUpdateRequestDto request, MultipartFile image, MultipartFile thumbnail) {
        Gifticon gifticon = gifticonRepository.findById(gifticonId)
                .orElseThrow(() -> new CustomException(ErrorCode.GIFTICON_NOT_FOUND));

        if(!gifticon.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN_USER);
        }

        Brand brand = brandRepository.findByName(request.getBrandName())
                .orElseThrow(() -> new CustomException(ErrorCode.INVALID_INPUT_VALUE));
        Category category = brand.getCategory();

        gifticon.updateInformation(brand, category, request.getProductName(), request.getExpiryDate(), request.getOriginalPrice());

        // 자동판매 설정 업데이트
        gifticon.updateAutoSaleSetting(
                request.getScheduledSaleDate(),
                request.getPlannedSalePrice()
        );

        // 원본 이미지 업데이트
        if(image != null && !image.isEmpty()) {
            try {
                log.info("기프티콘 수정 - 원본 이미지 파일 업로드 시작: originalFilename={}, size={}, contentType={}", 
                    image.getOriginalFilename(), image.getSize(), image.getContentType());
                String s3Key = fileUploader.upload(image, userId);
                log.info("기프티콘 수정 - 원본 이미지 파일 업로드 완료: s3Key={}", s3Key);
                
                // 기존 원본 이미지 삭제
                gifticonImageRepository.findByGifticonIdAndImageType(gifticonId, ImageType.ORIGINAL)
                        .ifPresent(gifticonImageRepository::delete);
                
                // 새 원본 이미지 저장
                GifticonImage gifticonImage = GifticonImage.builder()
                        .gifticon(gifticon)
                        .imageUrl(s3Key)
                        .s3Bucket(s3Bucket)
                        .s3Key(s3Key)
                        .imageType(ImageType.ORIGINAL)
                        .build();
                gifticonImageRepository.save(gifticonImage);
            } catch (Exception e) {
                log.error("기프티콘 수정 - 원본 이미지 업로드 중 오류 발생: {}", e.getMessage(), e);
                // 이미지 업로드 실패해도 다른 정보는 수정되므로 계속 진행
            }
        }

        // 썸네일 이미지 업데이트
        if(thumbnail != null && !thumbnail.isEmpty()) {
            try {
                log.info("기프티콘 수정 - 썸네일 이미지 파일 업로드 시작: originalFilename={}, size={}, contentType={}", 
                    thumbnail.getOriginalFilename(), thumbnail.getSize(), thumbnail.getContentType());
                String thumbnailS3Key = fileUploader.upload(thumbnail, userId);
                log.info("기프티콘 수정 - 썸네일 이미지 파일 업로드 완료: s3Key={}", thumbnailS3Key);
                
                // 기존 썸네일 이미지 삭제
                gifticonImageRepository.findByGifticonIdAndImageType(gifticonId, ImageType.THUMBNAIL)
                        .ifPresent(gifticonImageRepository::delete);
                
                // 새 썸네일 이미지 저장
                GifticonImage thumbnailImage = GifticonImage.builder()
                        .gifticon(gifticon)
                        .imageUrl(thumbnailS3Key)
                        .s3Bucket(s3Bucket)
                        .s3Key(thumbnailS3Key)
                        .imageType(ImageType.THUMBNAIL)
                        .build();
                gifticonImageRepository.save(thumbnailImage);
            } catch (Exception e) {
                log.error("기프티콘 수정 - 썸네일 이미지 업로드 중 오류 발생: {}", e.getMessage(), e);
                // 썸네일 업로드 실패해도 다른 정보는 수정되므로 계속 진행
            }
        }

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
    public void cancelUseGifticon(Long logId, Long userId, boolean isProduct) {
        GifticonUsageLog useLog = null;
        if(isProduct) {
            Long gifticonId = logId;

            // 상품권 기프티콘이 아니라면 이력으로만 삭제해야함.
            Gifticon gifticon = gifticonRepository.findById(gifticonId)
                    .orElseThrow(() -> new CustomException(ErrorCode.GIFTICON_NOT_FOUND));
            if(gifticon.getGifticonType() != GifticonType.PRODUCT) {
                throw new CustomException(ErrorCode.INVALID_INPUT_VALUE);
            }

            useLog = gifticonUsageLogRepository.findByGifticonIdAndIsCanceledFalse(gifticonId)
                    .orElseThrow(() -> new CustomException(ErrorCode.GIFTICON_NOT_FOUND));
            logId = useLog.getId();
        } else {
            useLog = gifticonUsageLogRepository.findById(logId)
                    .orElseThrow(() -> new CustomException(ErrorCode.USING_LOG_NOT_FOUND));
        }

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

    /**
     * 자동판매 대상 기프티콘 조회 (알림 불필요 - 사용자가 직접 설정한 경우)
     * - 판매 예정일이 도래한 기프티콘
     */
    @Override
    public List<AutoSaleTargetResponseDto> getAutoSaleTargetsWithoutNotification() {
        List<Gifticon> gifticons = gifticonRepository.findAutoSaleTargetsWithoutNotification(
                LocalDate.now(), GifticonStatus.NOT_USED);

        return convertToAutoSaleTargetDtos(gifticons);
    }

    /**
     * 시스템 제안 대상 기프티콘 조회 (알림 필요 - 유효기간 1달 이내)
     * - 자동판매 미설정이면서 유효기간 1달 이내인 기프티콘
     */
    @Override
    public List<AutoSaleTargetResponseDto> getAutoSaleTargetsWithNotification() {
        LocalDate today = LocalDate.now();
        LocalDate oneMonthLater = today.plusMonths(1);

        List<Gifticon> gifticons = gifticonRepository.findAutoSaleTargetsWithNotification(
                today, oneMonthLater, GifticonStatus.NOT_USED);

        return convertToAutoSaleTargetDtos(gifticons);
    }

    /**
     * 자동판매 처리 완료 표시 (판매 등록 후 설정 초기화)
     */
    @Override
    @Transactional
    public void markAutoSaleProcessed(Long gifticonId) {
        Gifticon gifticon = gifticonRepository.findById(gifticonId)
                .orElseThrow(() -> new CustomException(ErrorCode.GIFTICON_NOT_FOUND));

        gifticon.clearAutoSaleSetting();
    }

    /**
     * 기프티콘 정보 일괄 조회 - 내부 서버 호출용
     * - Payment 서버에서 판매글 목록 조회 시 사용
     * - 인증/권한 체크 없이 ID 목록으로 조회
     */
    @Override
    public List<GifticonResponseDto> getGifticonsByIds(List<Long> gifticonIds) {
        if (gifticonIds == null || gifticonIds.isEmpty()) {
            return List.of();
        }

        List<Gifticon> gifticons = gifticonRepository.findAllById(gifticonIds);
        
        // 이미지 일괄 조회
        // THUMBNAIL 이미지 먼저 조회
        Map<Long, String> imageMap = gifticonImageRepository.findAllByGifticonIdIn(gifticonIds, ImageType.THUMBNAIL).stream()
                .filter(img -> img.getS3Key() != null && !img.getS3Key().isEmpty())
                .collect(Collectors.toMap(
                        img -> img.getGifticon().getId(),
                        img -> fileUploader.getPresignedUrl(img.getS3Key()),
                        (existing, replacement) -> existing
                ));

        return gifticons.stream()
                .map(g -> GifticonResponseDto.builder()
                        .gifticonId(g.getId())
                        .userId(g.getUser().getId())
                        .brandId(g.getBrand().getId()) // 브랜드 ID 추가
                        .brandName(g.getBrand().getName())
                        .productName(g.getProductName())
                        .barcodeNumber(g.getBarcodeNumber())
                        .expiryDate(g.getExpiryDate())
                        .status(g.getStatus())
                        .imageUrl(imageMap.getOrDefault(g.getId(), null))
                        .originalPrice(g.getOriginalPrice())
                        .currentBalance(g.getCurrentBalance())
                        .categoryName(g.getCategory().getName())
                        .gifticonType(g.getGifticonType())
                        .build())
                .collect(Collectors.toList());
    }

    private List<AutoSaleTargetResponseDto> convertToAutoSaleTargetDtos(List<Gifticon> gifticons) {
        if (gifticons.isEmpty()) {
            return List.of();
        }

        List<Long> gifticonIds = gifticons.stream()
                .map(Gifticon::getId)
                .toList();

        Map<Long, String> imageMap = gifticonImageRepository.findAllByGifticonIdIn(gifticonIds, ImageType.ORIGINAL).stream()
                .collect(Collectors.toMap(
                        img -> img.getGifticon().getId(),
                        GifticonImage::getImageUrl,
                        (existing, replacement) -> existing
                ));

        return gifticons.stream()
                .map(g -> AutoSaleTargetResponseDto.from(g, imageMap.get(g.getId())))
                .toList();
    }
}
