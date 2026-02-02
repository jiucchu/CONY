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
import com.cony.payment.domain.sale.repository.SaleSpecification;
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
import org.springframework.data.domain.Sort;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.GeoResult;
import org.springframework.data.geo.GeoResults;
import org.springframework.data.jpa.domain.Specification;
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

        // 이미 판매 등록된 기프티콘인지 확인 (중복 방지)
        if (saleRepository.existsByGifticonId(request.getGifticonId())) {
            throw new CustomException(ErrorCode.DUPLICATE_SALE);
        }

        // 기프티콘 정보 조회 (Manage 서버 연동)
        GifticonResponse gifticon;
        try {
            gifticon = manageClient.getGifticon(request.getGifticonId());
        } catch (Exception e) {
            log.warn("Manage 서버 연동 실패 또는 기프티콘 없음: gifticonId={}", request.getGifticonId());
            throw new CustomException(ErrorCode.GIFTICON_NOT_FOUND);
        }

        Sale sale = Sale.builder()
                .sellerId(sellerId)
                .gifticonId(request.getGifticonId())
                .brandId(gifticon.getBrandId()) // 브랜드 ID 저장
                .expiryDate(gifticon.getExpiryDate()) // 유효기간 저장
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
        // 정렬 조건 처리 (최신순, 유효기간순)
        // 거리순(DISTANCE)은 Redis가 필요하므로 별도 처리, 나머지는 DB 정렬
        if (condition.getSort() != SaleSort.DISTANCE) {
            Sort sort = Sort.by(Sort.Direction.DESC, "createdAt"); // 기본 최신순
            if (condition.getSort() == SaleSort.EXPIRY) {
                sort = Sort.by(Sort.Direction.ASC, "expiryDate"); // 유효기간 임박순
            }
            pageable = org.springframework.data.domain.PageRequest.of(
                    pageable.getPageNumber(), pageable.getPageSize(), sort);
        }

        // DB 쿼리 실행 (Specification 활용 - 상태, 브랜드ID, 판매자ID 등)
        Specification<Sale> spec = SaleSpecification.search(condition);
        Page<Sale> salePage = saleRepository.findAll(spec, pageable);
        List<Sale> sales = salePage.getContent();

        if (sales.isEmpty()) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }

        // --- 여기서부터는 DTO 변환 및 추가 정보 매핑 ---

        // 2. 기프티콘 ID 목록 추출
        List<Long> gifticonIds = sales.stream()
                .map(Sale::getGifticonId)
                .distinct()
                .collect(Collectors.toList());

        // 3. Manage 서버에서 기프티콘 정보 조회 (Batch)
        Map<Long, GifticonResponse> gifticonMap = fetchGifticonInfos(gifticonIds);

        // 4. Sale + Gifticon 정보로 DTO 변환
        List<SaleListResponseDto> dtoList = sales.stream()
                .map(sale -> SaleListResponseDto.of(sale, gifticonMap.get(sale.getGifticonId())))
                .collect(Collectors.toList());

        // 5. 메모리 필터링 (키워드, 카테고리, 브랜드 이름)
        // -> 브랜드ID로 검색이 아니라 '브랜드 이름' 검색인 경우 여기서 처리해야 함 (현재 구조상 한계)
        // -> DB 필터링으로 못한 부분만 여기서 수행
        dtoList = applyFilters(dtoList, condition);

        // 6. 거리순 정렬 (Redis Geo)
        // -> 유효기간/최신순은 이미 DB에서 정렬해왔으므로 패스
        if (condition.getSort() == SaleSort.DISTANCE) {
            dtoList = applyDistanceSorting(dtoList, condition);
        }

        // 필터링 후 개수가 줄어들 수 있으므로 Page 객체 재생성 (TotalCount 부정확 주의)
        // *주의*: 메모리 필터링이 들어가면 페이징 처리가 꼬일 수 있음.
        // 완벽한 해결을 위해서는 Manage 서버의 브랜드 정보를 동기화하거나
        // 검색 전용 인덱스(Elasticsearch 등)를 도입해야 함.
        // 현재는 '조회된 페이지 내에서 필터링' 하는 방식으로 동작함.
        return new PageImpl<>(dtoList, pageable, salePage.getTotalElements());
    }

    /**
     * 거리순 정렬 적용
     */
    private List<SaleListResponseDto> applyDistanceSorting(List<SaleListResponseDto> list, SaleSearchCondition condition) {
        Map<String, Double> brandDistanceMap = Collections.emptyMap();
        if (condition.getLatitude() != null && condition.getLongitude() != null) {
            brandDistanceMap = getBrandMinDistances(condition.getLatitude(), condition.getLongitude());
        }

        if (brandDistanceMap.isEmpty()) {
            return list;
        }

        Map<String, Double> finalBrandDistanceMap = brandDistanceMap;
        return list.stream()
                .sorted(Comparator.comparing(
                        (SaleListResponseDto dto) -> finalBrandDistanceMap.getOrDefault(dto.getBrandName(), Double.MAX_VALUE)
                ).thenComparing(SaleListResponseDto::getCreatedAt, Comparator.reverseOrder()))
                .collect(Collectors.toList());
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
        boolean matchProduct = dto.getProductName() != null
                && dto.getProductName().toLowerCase().contains(lowerKeyword);
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
            if (brandNameObj == null)
                continue;

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
        List<Sale> sales = saleRepository.findByStatusOrderByCreatedAtDesc(SaleStatus.ON_SALE, Pageable.unpaged())
                .getContent();

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
    public Page<SaleListResponseDto> getMySalesWithGifticon(Long sellerId, SaleStatus status, String keyword,
            Pageable pageable) {
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
                        boolean matchBrand = dto.getBrandName() != null
                                && dto.getBrandName().toLowerCase().contains(lowerKeyword);
                        boolean matchProduct = dto.getProductName() != null
                                && dto.getProductName().toLowerCase().contains(lowerKeyword);
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
                    Integer salePrice = s.getPlannedSalePrice() != null ? s.getPlannedSalePrice()
                            : calculateDefaultSalePrice(s.getOriginalPrice());
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
                            .dDay(s.getExpiryDate() != null ? (int) java.time.temporal.ChronoUnit.DAYS.between(
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
     * 시스템 제안 승인 (유효기간 임박 기프티콘 판매 등록)
     * - 사용자가 제안을 승인하면 즉시 판매 등록
     *
     * @param userId 사용자 ID
     * @param gifticonId 기프티콘 ID
     * @param salePrice 판매가격 (null이면 기본 20% 할인 적용)
     * @return 등록된 Sale ID
     */
    @Transactional
    public Long approveSuggestion(Long userId, Long gifticonId, Integer salePrice) {
        // 이미 판매 등록된 기프티콘인지 확인
        if (saleRepository.existsByGifticonId(gifticonId)) {
            throw new CustomException(ErrorCode.DUPLICATE_SALE);
        }

        // 기프티콘 정보 조회
        GifticonResponse gifticon = manageClient.getGifticon(gifticonId);
        if (gifticon == null) {
            throw new CustomException(ErrorCode.GIFTICON_NOT_FOUND);
        }

        // 판매가격 계산 (파라미터로 받지 않으면 기본 20% 할인)
        int finalSalePrice = salePrice != null ? salePrice : calculateDefaultSalePrice(gifticon.getOriginalPrice());

        // Sale 등록 (ON_SALE - 즉시 판매)
        Sale sale = Sale.builder()
                .sellerId(userId)
                .gifticonId(gifticonId)
                .brandId(gifticon.getBrandId())
                .expiryDate(gifticon.getExpiryDate())
                .originalPrice(gifticon.getOriginalPrice())
                .salePrice(finalSalePrice)
                .build();

        saleRepository.save(sale);

        log.info("제안 승인 판매 등록: saleId={}, userId={}, gifticonId={}, salePrice={}",
                sale.getId(), userId, gifticonId, finalSalePrice);

        return sale.getId();
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