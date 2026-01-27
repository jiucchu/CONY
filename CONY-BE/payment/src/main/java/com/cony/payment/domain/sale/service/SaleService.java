package com.cony.payment.domain.sale.service;

import com.cony.payment.domain.sale.dto.SaleRequestDto;
import com.cony.payment.domain.sale.dto.SaleResponseDto;
import com.cony.payment.domain.sale.entity.Sale;
import com.cony.payment.domain.sale.enums.SaleStatus;
import com.cony.payment.domain.sale.repository.SaleRepository;
import com.cony.payment.domain.user.repository.UserRepository;
import com.cony.payment.global.error.CustomException;
import com.cony.payment.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SaleService {

    private final SaleRepository saleRepository;
    private final UserRepository userRepository;

    // TODO: FeignClient 연동 (기프티콘 유효성 검증)

    /**
     * 판매글 등록
     */
    @Transactional
    public Long createSale(Long sellerId, SaleRequestDto request) {
        if (!userRepository.existsById(sellerId)) {
            throw new CustomException(ErrorCode.USER_NOT_FOUND);
        }

        // 추후 구현: manageClient.checkGifticon(request.getGifticonId(), sellerId);

        Sale sale = Sale.builder()
                .sellerId(sellerId)
                .gifticonId(request.getGifticonId())
                .price(request.getPrice())
                .build();

        saleRepository.save(sale);
        log.info("판매 등록 완료: saleId={}, sellerId={}", sale.getId(), sellerId);

        return sale.getId();
    }

    /**
     * 판매중 목록 조회 (페이징)
     */
    public Page<SaleResponseDto> getSalesOnSale(Pageable pageable) {
        return saleRepository.findByStatusOrderByCreatedAtDesc(SaleStatus.ON_SALE, pageable)
                .map(SaleResponseDto::from);
    }

    /**
     * 판매글 상세 조회
     */
    public SaleResponseDto getSale(Long saleId) {
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new CustomException(ErrorCode.SALE_NOT_FOUND));
        return SaleResponseDto.from(sale);
    }

    /**
     * 내 판매글 목록 조회 (페이징)
     */
    public Page<SaleResponseDto> getMySales(Long sellerId, Pageable pageable) {
        return saleRepository.findBySellerIdOrderByCreatedAtDesc(sellerId, pageable)
                .map(SaleResponseDto::from);
    }

    /**
     * 내 판매 완료 목록 조회 (페이징)
     */
    public Page<SaleResponseDto> getMySoldSales(Long sellerId, Pageable pageable) {
        return saleRepository.findBySellerIdAndStatusOrderByCreatedAtDesc(sellerId, SaleStatus.SOLD_OUT, pageable)
                .map(SaleResponseDto::from);
    }

    /**
     * 판매 취소 (데이터 삭제)
     */
    @Transactional
    public void cancelSale(Long userId, Long saleId) {
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new CustomException(ErrorCode.SALE_NOT_FOUND));

        // 본인 판매글인지 확인
        if (!sale.getSellerId().equals(userId)) {
            throw new CustomException(ErrorCode.SALE_NOT_OWNED);
        }

        // 판매중인 상품만 취소 가능
        if (sale.getStatus() != SaleStatus.ON_SALE) {
            throw new CustomException(ErrorCode.INVALID_SALE_STATUS);
        }

        saleRepository.delete(sale);
        log.info("판매 취소(삭제) 완료: saleId={}, userId={}", saleId, userId);
    }
}
