package com.cony.payment.domain.purchase.service;

import com.cony.payment.domain.purchase.dto.PurchaseResponseDto;
import com.cony.payment.domain.purchase.entity.Purchase;
import com.cony.payment.domain.purchase.repository.PurchaseRepository;
import com.cony.payment.domain.sale.entity.Sale;
import com.cony.payment.domain.sale.enums.SaleStatus;
import com.cony.payment.domain.sale.repository.SaleRepository;
import com.cony.payment.domain.transaction.enums.TransactionType;
import com.cony.payment.domain.transaction.service.TransactionService;
import com.cony.payment.domain.user.entity.User;
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
public class PurchaseService {

    private final UserRepository userRepository;
    private final SaleRepository saleRepository;
    private final PurchaseRepository purchaseRepository;
    private final TransactionService transactionService;

    /**
     * 기프티콘 구매 (포인트 차감 -> 판매자 지급 -> 상태 변경)
     */
    @Transactional
    public void purchaseGifticon(Long buyerId, Long saleId) {
        log.info("구매 요청 시작: buyerId={}, saleId={}", buyerId, saleId);

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 비관적 락을 사용하여 동시 구매 방지
        Sale sale = saleRepository.findByIdWithLock(saleId)
                .orElseThrow(() -> new CustomException(ErrorCode.SALE_NOT_FOUND));

        validatePurchase(buyer, sale);

        Integer purchasePrice = sale.getSalePrice();

        // 포인트 이동 (구매자 차감 / 판매자 지급)
        buyer.deductPoint(Long.valueOf(purchasePrice));

        User seller = userRepository.findById(sale.getSellerId())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        seller.chargePoint(Long.valueOf(purchasePrice));

        sale.soldOut();

        Purchase purchase = Purchase.builder()
                .saleId(saleId)
                .buyerId(buyerId)
                .price(purchasePrice)
                .build();
        purchaseRepository.save(purchase);

        // 거래 로그 기록
        transactionService.createTransaction(buyer, TransactionType.PURCHASE, -Long.valueOf(purchasePrice), "기프티콘 구매");
        transactionService.createTransaction(seller, TransactionType.SALE, Long.valueOf(purchasePrice), "기프티콘 판매 수익");

        log.info("구매 거래 완료: purchaseId={}", purchase.getId());
    }

    /**
     * 내 구매 목록 조회 (페이징)
     */
    public Page<PurchaseResponseDto> getMyPurchases(Long buyerId, Pageable pageable) {
        return purchaseRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId, pageable)
                .map(PurchaseResponseDto::from);
    }

    // 검증 로직 분리
    private void validatePurchase(User buyer, Sale sale) {
        // 이미 팔렸는지 확인
        if (sale.getStatus() == SaleStatus.SOLD_OUT) {
            throw new CustomException(ErrorCode.ALREADY_SOLD_OUT);
        }
        // 판매대기 상태는 구매 불가
        if (sale.getStatus() == SaleStatus.PENDING) {
            throw new CustomException(ErrorCode.INVALID_SALE_STATUS);
        }
        // 본인 물건 구매 불가
        if (sale.getSellerId().equals(buyer.getId())) {
            throw new CustomException(ErrorCode.CANNOT_BUY_OWN_PRODUCT);
        }
        // 포인트 잔액 부족 확인
        if (buyer.getPointBalance() < sale.getSalePrice()) {
            throw new CustomException(ErrorCode.INSUFFICIENT_POINTS);
        }
    }
}
