package com.cony.payment.domain.sale.service;

import com.cony.payment.domain.sale.dto.SaleListResponseDto;
import com.cony.payment.domain.sale.dto.SaleRequestDto;
import com.cony.payment.domain.sale.dto.SaleSearchCondition;
import com.cony.payment.domain.sale.dto.SaleStatsDto;
import com.cony.payment.domain.sale.entity.Sale;
import com.cony.payment.domain.sale.enums.SaleCategory;
import com.cony.payment.domain.sale.enums.SaleSort;
import com.cony.payment.domain.sale.enums.SaleStatus;
import com.cony.payment.domain.sale.repository.SaleRepository;
import com.cony.payment.domain.user.repository.UserRepository;
import com.cony.payment.global.error.CustomException;
import com.cony.payment.global.error.ErrorCode;
import com.cony.payment.infrastructure.manage.client.ManageClient;
import com.cony.payment.infrastructure.manage.dto.GifticonResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.GeoResult;
import org.springframework.data.geo.GeoResults;
import org.springframework.data.redis.connection.RedisGeoCommands;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.domain.geo.GeoReference;
import org.springframework.data.redis.domain.geo.Metrics;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SaleService {

    private final SaleRepository saleRepository;
    private final UserRepository userRepository;
    private final ManageClient manageClient;
    private final StringRedisTemplate redisTemplate;

    private static final double SEARCH_RADIUS_KM = 5.0; // 거리순 검색 반경 (km)
    private static final String REDIS_GEO_KEY = "stores:geo";

    /**
     * 판매글 등록
     * - scheduledSaleDate가 있고 미래 날짜면 → PENDING (판매대기)
     * - scheduledSaleDate가 없거나 오늘/과거면 → ON_SALE (즉시 판매)
     */
    @Transactional
    public Long createSale(Long sellerId, SaleRequestDto request) {
        if (!userRepository.existsById(sellerId)) {
            throw new CustomException(ErrorCode.USER_NOT_FOUND);
        }

        // 기프티콘 존재 확인 (Manage 서버 연동)
        try {
            if (!manageClient.existsGifticon(request.getGifticonId())) {
                throw new CustomException(ErrorCode.GIFTICON_NOT_FOUND);
            }
        } catch (Exception e) {
            log.warn("Manage 서버 연동 실패, 기프티콘 검증 스킵: gifticonId={}", request.getGifticonId());
        }

        // 이미 판매 등록된 기프티콘인지 확인 (중복 방지)
        if (saleRepository.existsByGifticonId(request.getGifticonId())) {
            throw new CustomException(ErrorCode.DUPLICATE_SALE);
        }

        Sale sale = Sale.builder()
                .sellerId(sellerId)
                .gifticonId(request.getGifticonId())
                .originalPrice(request.getOriginalPrice())
                .salePrice(request.getSalePrice())
                .scheduledSaleDate(request.getScheduledSaleDate())
                .build();

        saleRepository.save(sale);

        if (sale.getScheduledSaleDate() != null) {
            log.info("자동판매 대기 등록: saleId={}, sellerId={}, scheduledDate={}",
                    sale.getId(), sellerId, sale.getScheduledSaleDate());
        } else {
            log.info("즉시 판매 등록: saleId={}, sellerId={}", sale.getId(), sellerId);
        }

        return sale.getId();
    }

    /**
     * 판매 목록 검색 (필터/정렬 포함)
     */
    public Page<SaleListResponseDto> searchSales(SaleSearchCondition condition, Pageable pageable) {
        // 1. 판매중인 상품 전체 조회
        Page<Sale> salePage = saleRepository.findByStatusOrderByCreatedAtDesc(SaleStatus.ON_SALE, pageable);
        List<Sale> sales = salePage.getContent();

        if (sales.isEmpty()) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }

        // 2. 기프티콘 ID 목록 추출
        List<Long> gifticonIds = sales.stream()
                .map(Sale::getGifticonId)
                .distinct()
                .collect(Collectors.toList());

        // 3. Manage 서버에서 기프티콘 정보 조회
        Map<Long, GifticonResponse> gifticonMap = fetchGifticonInfos(gifticonIds);

        // 4. Sale + Gifticon 정보로 DTO 변환
        List<SaleListResponseDto> dtoList = sales.stream()
                .map(sale -> SaleListResponseDto.of(sale, gifticonMap.get(sale.getGifticonId())))
                .collect(Collectors.toList());

        // 5. 필터링 적용
        dtoList = applyFilters(dtoList, condition);

        // 6. 정렬 적용
        dtoList = applySorting(dtoList, condition);

        return new PageImpl<>(dtoList, pageable, salePage.getTotalElements());
    }

    /**
     * Manage 서버에서 기프티콘 정보 조회
     */
    private Map<Long, GifticonResponse> fetchGifticonInfos(List<Long> gifticonIds) {
        try {
            return manageClient.getGifticons(gifticonIds);
        } catch (Exception e) {
            log.warn("Manage 서버 연동 실패, 기프티콘 정보 없이 응답: {}", e.getMessage());
            return Collections.emptyMap();
        }
    }

    /**
     * 필터링 적용 (키워드, 카테고리, 브랜드)
     */
    private List<SaleListResponseDto> applyFilters(List<SaleListResponseDto> list, SaleSearchCondition condition) {
        return list.stream()
                .filter(dto -> filterByKeyword(dto, condition.getKeyword()))
                .filter(dto -> filterByCategory(dto, condition.getCategory()))
                .filter(dto -> filterByBrand(dto, condition.getBrand()))
                .collect(Collectors.toList());
    }

    private boolean filterByKeyword(SaleListResponseDto dto, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return true;
        }
        String lowerKeyword = keyword.toLowerCase();
        boolean matchBrand = dto.getBrandName() != null && dto.getBrandName().toLowerCase().contains(lowerKeyword);
        boolean matchProduct = dto.getProductName() != null && dto.getProductName().toLowerCase().contains(lowerKeyword);
        return matchBrand || matchProduct;
    }

    private boolean filterByCategory(SaleListResponseDto dto, SaleCategory category) {
        if (category == null || category == SaleCategory.ALL) {
            return true;
        }
        if (dto.getCategoryName() == null) {
            return false;
        }
        // 카테고리 매칭 (대소문자 무시)
        return dto.getCategoryName().equalsIgnoreCase(category.name()) ||
               dto.getCategoryName().equalsIgnoreCase(category.getDescription());
    }

    private boolean filterByBrand(SaleListResponseDto dto, String brand) {
        if (brand == null || brand.isBlank()) {
            return true;
        }
        return dto.getBrandName() != null && dto.getBrandName().equalsIgnoreCase(brand);
    }

    /**
     * 정렬 적용
     */
    private List<SaleListResponseDto> applySorting(List<SaleListResponseDto> list, SaleSearchCondition condition) {
        SaleSort sort = condition.getSort();
        if (sort == null) {
            sort = SaleSort.LATEST;
        }

        Comparator<SaleListResponseDto> comparator;

        switch (sort) {
            case EXPIRY:
                // 유효기간 임박순 (D-day 오름차순)
                comparator = Comparator.comparing(
                        SaleListResponseDto::getDDay,
                        Comparator.nullsLast(Comparator.naturalOrder())
                );
                break;
            case DISTANCE:
                // 거리순: Redis GeoSearch 활용
                Map<String, Double> brandDistanceMap = Collections.emptyMap();
                if (condition.getLatitude() != null && condition.getLongitude() != null) {
                    brandDistanceMap = getBrandMinDistances(condition.getLatitude(), condition.getLongitude());
                }

                if (brandDistanceMap.isEmpty()) {
                    // 주변 매장 정보가 없으면 등록순(최신순)으로 대체하되, 로깅
                    log.debug("거리순 정렬 요청왔으나 주변 매장 정보 없음 (또는 좌표 누락). fallback to LATEST");
                    comparator = Comparator.comparing(
                            SaleListResponseDto::getCreatedAt,
                            Comparator.nullsLast(Comparator.reverseOrder())
                    );
                } else {
                    Map<String, Double> finalBrandDistanceMap = brandDistanceMap;
                    // 거리 오름차순. 거리가 없으면(주변 매장 없는 브랜드) 맨 뒤로(MAX_VALUE)
                    comparator = Comparator.comparing(
                            (SaleListResponseDto dto) -> finalBrandDistanceMap.getOrDefault(dto.getBrandName(), Double.MAX_VALUE)
                    ).thenComparing(
                            SaleListResponseDto::getCreatedAt,
                            Comparator.nullsLast(Comparator.reverseOrder())
                    );
                }
                break;
            case LATEST:
            default:
                // 등록순 (최신순)
                comparator = Comparator.comparing(
                        SaleListResponseDto::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())
                );
                break;
        }

        return list.stream().sorted(comparator).collect(Collectors.toList());
    }

    /**
     * 현재 위치 기준 반경 내 브랜드별 최소 거리 조회 (Redis)
     */
    private Map<String, Double> getBrandMinDistances(double lat, double lon) {
        // 1. Redis GEO Search (반경 5km)
        Distance radius = new Distance(SEARCH_RADIUS_KM, Metrics.KILOMETERS);
        GeoResults<RedisGeoCommands.GeoLocation<String>> geoResults = redisTemplate.opsForGeo()
                .search(REDIS_GEO_KEY,
                        GeoReference.fromCoordinate(lon, lat),
                        radius,
                        RedisGeoCommands.GeoSearchCommandArgs.newGeoSearchArgs().includeDistance());

        if (geoResults == null || geoResults.getContent().isEmpty()) {
            return Collections.emptyMap();
        }

        List<GeoResult<RedisGeoCommands.GeoLocation<String>>> results = geoResults.getContent();
        
        // 2. Pipeline을 통해 각 storeId에 대한 brandName 조회
        List<Object> brandNames = redisTemplate.executePipelined((RedisCallback<Object>) connection -> {
            RedisSerializer<String> serializer = redisTemplate.getStringSerializer();
            for (GeoResult<RedisGeoCommands.GeoLocation<String>> result : results) {
                String storeId = result.getContent().getName();
                byte[] key = serializer.serialize("stores:info:" + storeId);
                byte[] field = serializer.serialize("brandName");
                connection.hashCommands().hGet(key, field);
            }
            return null;
        });

        // 3. 결과 매핑 (BrandName -> Min Distance)
        Map<String, Double> brandMinDistanceMap = new HashMap<>();
        for (int i = 0; i < results.size(); i++) {
            Object brandNameObj = brandNames.get(i);
            if (brandNameObj == null) continue;

            String brandName = (String) brandNameObj;
            double distance = results.get(i).getDistance().getValue(); // km 단위 (Metrics.KILOMETERS 기준이면)

            // 같은 브랜드가 여러 매장일 경우, 더 가까운 거리로 갱신
            if (brandMinDistanceMap.containsKey(brandName)) {
                double currentMin = brandMinDistanceMap.get(brandName);
                if (distance < currentMin) {
                    brandMinDistanceMap.put(brandName, distance);
                }
            } else {
                brandMinDistanceMap.put(brandName, distance);
            }
        }
        return brandMinDistanceMap;
    }

    /**
     * 판매중인 브랜드 목록 조회
     */
    public List<String> getSaleBrands() {
        List<Sale> sales = saleRepository.findByStatusOrderByCreatedAtDesc(SaleStatus.ON_SALE, Pageable.unpaged()).getContent();

        if (sales.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> gifticonIds = sales.stream()
                .map(Sale::getGifticonId)
                .distinct()
                .collect(Collectors.toList());

        Map<Long, GifticonResponse> gifticonMap = fetchGifticonInfos(gifticonIds);

        return gifticonMap.values().stream()
                .map(GifticonResponse::getBrandName)
                .filter(Objects::nonNull)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    /**
     * 판매글 상세 조회 (기프티콘 정보 포함)
     */
    public SaleListResponseDto getSaleDetail(Long saleId) {
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new CustomException(ErrorCode.SALE_NOT_FOUND));

        // 기프티콘 정보 조회
        GifticonResponse gifticon = null;
        try {
            gifticon = manageClient.getGifticon(sale.getGifticonId());
        } catch (Exception e) {
            log.warn("기프티콘 정보 조회 실패: gifticonId={}", sale.getGifticonId());
        }

        return SaleListResponseDto.of(sale, gifticon);
    }

    /**
     * 내 판매글 목록 조회 (상태별 필터 + 검색 + 기프티콘 정보 포함)
     */
    public Page<SaleListResponseDto> getMySalesWithGifticon(Long sellerId, SaleStatus status, String keyword, Pageable pageable) {
        Page<Sale> salePage;

        if (status != null) {
            salePage = saleRepository.findBySellerIdAndStatusOrderByCreatedAtDesc(sellerId, status, pageable);
        } else {
            salePage = saleRepository.findBySellerIdOrderByCreatedAtDesc(sellerId, pageable);
        }

        List<Sale> sales = salePage.getContent();

        if (sales.isEmpty()) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }

        // 기프티콘 ID 목록 추출
        List<Long> gifticonIds = sales.stream()
                .map(Sale::getGifticonId)
                .distinct()
                .collect(Collectors.toList());

        // Manage 서버에서 기프티콘 정보 조회
        Map<Long, GifticonResponse> gifticonMap = fetchGifticonInfos(gifticonIds);

        // Sale + Gifticon 정보로 DTO 변환
        List<SaleListResponseDto> dtoList = sales.stream()
                .map(sale -> SaleListResponseDto.of(sale, gifticonMap.get(sale.getGifticonId())))
                .collect(Collectors.toList());

        // 키워드 검색 필터링 (브랜드명, 상품명)
        if (keyword != null && !keyword.isBlank()) {
            String lowerKeyword = keyword.toLowerCase();
            dtoList = dtoList.stream()
                    .filter(dto -> {
                        boolean matchBrand = dto.getBrandName() != null && dto.getBrandName().toLowerCase().contains(lowerKeyword);
                        boolean matchProduct = dto.getProductName() != null && dto.getProductName().toLowerCase().contains(lowerKeyword);
                        return matchBrand || matchProduct;
                    })
                    .collect(Collectors.toList());
        }

        return new PageImpl<>(dtoList, pageable, dtoList.size());
    }

    /**
     * 판매 취소 (데이터 삭제) - 판매대기/판매중 모두 가능
     */
    @Transactional
    public void cancelSale(Long userId, Long saleId) {
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new CustomException(ErrorCode.SALE_NOT_FOUND));

        // 본인 판매글인지 확인
        if (!sale.getSellerId().equals(userId)) {
            throw new CustomException(ErrorCode.SALE_NOT_OWNED);
        }

        // 판매대기 또는 판매중인 상품만 취소 가능
        if (sale.getStatus() == SaleStatus.SOLD_OUT) {
            throw new CustomException(ErrorCode.INVALID_SALE_STATUS);
        }

        saleRepository.delete(sale);
        log.info("판매 취소(삭제) 완료: saleId={}, userId={}, status={}", saleId, userId, sale.getStatus());
    }

    /**
     * 판매 시작 (대기 -> 판매중)
     */
    @Transactional
    public void startSale(Long userId, Long saleId) {
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new CustomException(ErrorCode.SALE_NOT_FOUND));

        // 본인 판매글인지 확인
        if (!sale.getSellerId().equals(userId)) {
            throw new CustomException(ErrorCode.SALE_NOT_OWNED);
        }

        // 판매대기 상태만 판매 시작 가능
        if (sale.getStatus() != SaleStatus.PENDING) {
            throw new CustomException(ErrorCode.INVALID_SALE_STATUS);
        }

        sale.startSale();
        log.info("판매 시작 완료: saleId={}, userId={}", saleId, userId);
    }

    /**
     * 내 판매 통계 조회
     */
    public SaleStatsDto getMySaleStats(Long sellerId) {
        long pendingCount = saleRepository.countBySellerIdAndStatus(sellerId, SaleStatus.PENDING);
        long onSaleCount = saleRepository.countBySellerIdAndStatus(sellerId, SaleStatus.ON_SALE);
        long soldOutCount = saleRepository.countBySellerIdAndStatus(sellerId, SaleStatus.SOLD_OUT);

        return SaleStatsDto.builder()
                .pendingCount(pendingCount)
                .onSaleCount(onSaleCount)
                .soldOutCount(soldOutCount)
                .build();
    }

    /**
     * 판매글 수정 (가격 변경)
     */
    @Transactional
    public void updateSale(Long userId, Long saleId, Integer newSalePrice) {
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new CustomException(ErrorCode.SALE_NOT_FOUND));

        // 본인 판매글인지 확인
        if (!sale.getSellerId().equals(userId)) {
            throw new CustomException(ErrorCode.SALE_NOT_OWNED);
        }

        // 판매대기 또는 판매중인 상품만 수정 가능 (판매완료는 수정 불가)
        if (sale.getStatus() == SaleStatus.SOLD_OUT) {
            throw new CustomException(ErrorCode.INVALID_SALE_STATUS);
        }

        sale.updatePrice(newSalePrice);
        log.info("판매글 수정 완료: saleId={}, newPrice={}", saleId, newSalePrice);
    }

    /**
     * 시스템 제안 목록 조회 (유효기간 1달 이내 기프티콘)
     * - Manage 서버에서 유효기간 1달 이내 + 자동판매 미설정 기프티콘 조회
     * - 이미 Sale이 등록된 기프티콘은 제외
     */
    public List<SaleListResponseDto> getSaleSuggestions(Long userId) {
        // Manage 서버에서 시스템 제안 대상 조회
        var suggestions = manageClient.getAutoSaleTargetsWithNotification();

        if (suggestions.isEmpty()) {
            return Collections.emptyList();
        }

        // 현재 사용자의 기프티콘만 필터링 + 이미 Sale이 등록된 건 제외
        return suggestions.stream()
                .filter(s -> s.getUserId().equals(userId))
                .filter(s -> !saleRepository.existsByGifticonId(s.getGifticonId()))
                .map(s -> {
                    Integer salePrice = s.getPlannedSalePrice() != null ? s.getPlannedSalePrice() :
                            calculateDefaultSalePrice(s.getOriginalPrice());
                    Integer discountRate = calculateDiscountRate(s.getOriginalPrice(), salePrice);

                    return SaleListResponseDto.builder()
                            .gifticonId(s.getGifticonId())
                            .sellerId(s.getUserId())
                            .originalPrice(s.getOriginalPrice())
                            .salePrice(salePrice)
                            .discountRate(discountRate)
                            .brandName(s.getBrandName())
                            .productName(s.getProductName())
                            .imageUrl(s.getImageUrl())
                            .expiryDate(s.getExpiryDate())
                            .dDay(s.getExpiryDate() != null ?
                                    (int) java.time.temporal.ChronoUnit.DAYS.between(
                                            java.time.LocalDate.now(), s.getExpiryDate()) : 0)
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * 기본 판매가격 계산 (20% 할인)
     */
    private Integer calculateDefaultSalePrice(Integer originalPrice) {
        if (originalPrice == null || originalPrice <= 0) {
            return 0;
        }
        int defaultDiscountRate = 20;
        return originalPrice * (100 - defaultDiscountRate) / 100;
    }

    /**
     * 할인율 계산
     */
    private Integer calculateDiscountRate(Integer originalPrice, Integer salePrice) {
        if (originalPrice == null || originalPrice <= 0) {
            return 0;
        }
        return (int) Math.round((1 - (double) salePrice / originalPrice) * 100);
    }
}