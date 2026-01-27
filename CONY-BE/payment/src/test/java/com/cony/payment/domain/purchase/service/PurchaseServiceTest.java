package com.cony.payment.domain.purchase.service;

import com.cony.payment.domain.sale.dto.SaleRequestDto;
import com.cony.payment.domain.sale.entity.Sale;
import com.cony.payment.domain.sale.enums.SaleStatus;
import com.cony.payment.domain.sale.repository.SaleRepository;
import com.cony.payment.domain.sale.service.SaleService;
import com.cony.payment.domain.transaction.entity.Transaction;
import com.cony.payment.domain.transaction.enums.TransactionType;
import com.cony.payment.domain.transaction.repository.TransactionRepository;
import com.cony.payment.domain.user.entity.User;
import com.cony.payment.domain.user.enums.OAuthProvider;
import com.cony.payment.domain.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class PurchaseServiceTest {

    @Autowired PurchaseService purchaseService;
    @Autowired SaleService saleService;
    @Autowired UserRepository userRepository;
    @Autowired SaleRepository saleRepository;
    @Autowired TransactionRepository transactionRepository;

    @Test
    @DisplayName("구매 성공 시: 잔액 변경, 판매상태 변경, 거래내역 저장이 모두 수행되어야 한다")
    void purchaseSuccessTest() {
        // ============================================
        // 1. Given (준비)
        // ============================================

        // 판매자 생성 (pointBalance 부분 제거함 -> 자동 0원)
        User seller = User.builder()
                .email("seller@test.com")
                .name("판매자")
                .oauthProvider(OAuthProvider.KAKAO)
                .build();
        userRepository.save(seller);

        // 구매자 생성 (pointBalance 부분 제거함 -> 자동 0원)
        User buyer = User.builder()
                .email("buyer@test.com")
                .name("구매자")
                .oauthProvider(OAuthProvider.KAKAO)
                .build();

        // 구매자는 돈이 있어야 하므로 별도 충전 메서드 호출
        buyer.chargePoint(10000L);
        userRepository.save(buyer);

        // 판매글 등록 (기프티콘ID: 100, 가격: 3,000원)
        SaleRequestDto saleRequest = new SaleRequestDto(100L, 3000L);
        Long saleId = saleService.createSale(seller.getId(), saleRequest);

        // ============================================
        // 2. When (실행 - 구매하기)
        // ============================================
        purchaseService.purchaseGifticon(buyer.getId(), saleId);

        // ============================================
        // 3. Then (검증)
        // ============================================

        // [검증 1] 구매자 잔액 확인 (10,000 - 3,000 = 7,000)
        User savedBuyer = userRepository.findById(buyer.getId()).orElseThrow();
        assertThat(savedBuyer.getPointBalance()).isEqualTo(7000L);

        // [검증 2] 판매자 잔액 확인 (0 + 3,000 = 3,000)
        User savedSeller = userRepository.findById(seller.getId()).orElseThrow();
        assertThat(savedSeller.getPointBalance()).isEqualTo(3000L);

        // [검증 3] 판매글 상태 확인 (SOLD_OUT 이어야 함)
        Sale savedSale = saleRepository.findById(saleId).orElseThrow();
        assertThat(savedSale.getStatus()).isEqualTo(SaleStatus.SOLD_OUT);

        // [검증 4] 거래 내역(Transaction) 기록 확인
        // 구매자 로그 확인
        List<Transaction> buyerLogs = transactionRepository.findTop10ByUserOrderByCreatedAtDesc(savedBuyer);
        assertThat(buyerLogs).hasSizeGreaterThan(0);
        Transaction purchaseTx = buyerLogs.get(0);
        assertThat(purchaseTx.getType()).isEqualTo(TransactionType.PURCHASE);
        assertThat(purchaseTx.getAmount()).isEqualTo(-3000L); // 차감 확인

        // 판매자 로그 확인
        List<Transaction> sellerLogs = transactionRepository.findTop10ByUserOrderByCreatedAtDesc(savedSeller);
        assertThat(sellerLogs).hasSize(1);
        Transaction saleTx = sellerLogs.get(0);
        assertThat(saleTx.getType()).isEqualTo(TransactionType.SALE);
        assertThat(saleTx.getAmount()).isEqualTo(3000L); // 입금 확인
    }
}