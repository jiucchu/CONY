package com.cony.payment.domain.point.service;

import com.cony.payment.domain.transaction.enums.TransactionType;
import com.cony.payment.domain.transaction.service.TransactionService;
import com.cony.payment.domain.user.entity.User;
import com.cony.payment.domain.user.enums.OAuthProvider;
import com.cony.payment.domain.user.repository.UserRepository;
import com.cony.payment.global.error.CustomException;
import com.cony.payment.global.error.ErrorCode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@Transactional
class PointServiceTest {

    @Autowired
    private PointService pointService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionService transactionService;

    private User testUser;

    @BeforeEach
    void setUp() {
        // 테스트 사용자 생성
        testUser = User.builder()
                .email("test@test.com")
                .name("테스터")
                .oauthProvider(OAuthProvider.GOOGLE)
                .oauthId("google_123")
                .profileImageUrl("http://profile.url")
                .build();

        userRepository.save(testUser);
    }

    @Test
    @DisplayName("포인트 충전 성공")
    void chargePoint_Success() {
        // given
        Long chargeAmount = 10000L;

        // when
        Long balance = pointService.chargePoint(testUser.getId(), chargeAmount);

        // then
        assertThat(balance).isEqualTo(10000L);

        User updatedUser = userRepository.findById(testUser.getId()).get();
        assertThat(updatedUser.getPointBalance()).isEqualTo(10000L);
    }

    @Test
    @DisplayName("포인트 충전 - 금액이 0 이하일 때 예외 발생")
    void chargePoint_InvalidAmount() {
        // given
        Long invalidAmount = 0L;

        // when & then
        assertThatThrownBy(() -> pointService.chargePoint(testUser.getId(), invalidAmount))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_POINT_AMOUNT);
    }

    @Test
    @DisplayName("포인트 잔액 조회")
    void getPointBalance() {
        // given
        pointService.chargePoint(testUser.getId(), 10000L);

        // when
        Long balance = pointService.getPointBalance(testUser.getId());

        // then
        assertThat(balance).isEqualTo(10000L);
    }

    @Test
    @DisplayName("존재하지 않는 사용자 - 예외 발생")
    void chargePoint_UserNotFound() {
        // given
        Long nonExistentUserId = 999L;

        // when & then
        assertThatThrownBy(() -> pointService.chargePoint(nonExistentUserId, 10000L))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_FOUND);
    }
}