package com.cony.payment.domain.transaction.service;

import com.cony.payment.domain.transaction.entity.Transaction;
import com.cony.payment.domain.transaction.enums.TransactionType;
import com.cony.payment.domain.transaction.repository.TransactionRepository;
import com.cony.payment.domain.user.entity.User;
import com.cony.payment.domain.user.enums.OAuthProvider;
import com.cony.payment.domain.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class TransactionServiceTest {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .email("test@test.com")
                .name("테스터")
                .oauthProvider(OAuthProvider.GOOGLE)
                .oauthId("google_123")
                .profileImageUrl("http://profile.url")
                .build();

        userRepository.save(testUser);

        // 포인트 충전
        testUser.chargePoint(10000L);
        userRepository.save(testUser);
    }

    @Test
    @DisplayName("거래 내역 생성")
    void createTransaction() {
        // when
        Transaction transaction = transactionService.createTransaction(
                testUser,
                TransactionType.CHARGE,
                10000L,
                "카카오페이 포인트 충전"
        );

        // then
        assertThat(transaction).isNotNull();
        assertThat(transaction.getUser()).isEqualTo(testUser);
        assertThat(transaction.getType()).isEqualTo(TransactionType.CHARGE);
        assertThat(transaction.getAmount()).isEqualTo(10000L);
    }

    @Test
    @DisplayName("사용자별 거래 내역 조회 - 페이징")
    void getTransactionsByUser() {
        // given
        for (int i = 0; i < 5; i++) {
            transactionService.createTransaction(
                    testUser,
                    TransactionType.CHARGE,
                    1000L * (i + 1),
                    "테스트 거래 " + i
            );
        }

        // when
        Page<Transaction> transactions = transactionService.getTransactionsByUser(
                testUser,
                PageRequest.of(0, 3)
        );

        // then
        assertThat(transactions.getContent()).hasSize(3);
        assertThat(transactions.getTotalElements()).isEqualTo(5);
    }

    @Test
    @DisplayName("타입별 거래 내역 조회")
    void getTransactionsByUserAndType() {
        // given
        transactionService.createTransaction(testUser, TransactionType.CHARGE, 10000L, "충전");
        transactionService.createTransaction(testUser, TransactionType.PURCHASE, -5000L, "구매");
        transactionService.createTransaction(testUser, TransactionType.CHARGE, 20000L, "충전2");

        // when
        Page<Transaction> chargeTransactions = transactionService.getTransactionsByUserAndType(
                testUser,
                TransactionType.CHARGE,
                PageRequest.of(0, 10)
        );

        // then
        assertThat(chargeTransactions.getContent()).hasSize(2);
        assertThat(chargeTransactions.getContent())
                .allMatch(t -> t.getType() == TransactionType.CHARGE);
    }

    @Test
    @DisplayName("최근 거래 내역 조회")
    void getRecentTransactions() {
        // given
        for (int i = 0; i < 15; i++) {
            transactionService.createTransaction(
                    testUser,
                    TransactionType.CHARGE,
                    1000L,
                    "테스트 " + i
            );
        }

        // when
        List<Transaction> recentTransactions = transactionService.getRecentTransactions(testUser);

        // then
        assertThat(recentTransactions).hasSize(10); // 최근 10개만 조회
    }
}