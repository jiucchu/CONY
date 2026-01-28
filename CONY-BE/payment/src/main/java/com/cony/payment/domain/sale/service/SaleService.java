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

    /**
     * 판매글 등록
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

        Sale sale = Sale.builder()
                .sellerId(sellerId)
                .gifticonId(request.getGifticonId())
                .originalPrice(request.getOriginalPrice())
                .salePrice(request.getSalePrice())
                .build();

        saleRepository.save(sale);
        log.info("판매 등록 완료: saleId={}, sellerId={}", sale.getId(), sellerId);

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
                // 거리순 (현재는 미구현, 등록순으로 대체)
                // TODO: 위치 기반 정렬 구현
                comparator = Comparator.comparing(
                        SaleListResponseDto::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())
                );
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
     * 내 판매글 목록 조회 (상태별 필터 + 기프티콘 정보 포함)
     */
    public Page<SaleListResponseDto> getMySalesWithGifticon(Long sellerId, SaleStatus status, Pageable pageable) {
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

        return new PageImpl<>(dtoList, pageable, salePage.getTotalElements());
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
    public void updateSale(Long userId, Long saleId, Long newSalePrice) {
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new CustomException(ErrorCode.SALE_NOT_FOUND));

        // 본인 판매글인지 확인
        if (!sale.getSellerId().equals(userId)) {
            throw new CustomException(ErrorCode.SALE_NOT_OWNED);
        }

        // 판매중인 상품만 수정 가능
        if (sale.getStatus() != SaleStatus.ON_SALE) {
            throw new CustomException(ErrorCode.INVALID_SALE_STATUS);
        }

        sale.updatePrice(newSalePrice);
        log.info("판매글 수정 완료: saleId={}, newPrice={}", saleId, newSalePrice);
    }
}
