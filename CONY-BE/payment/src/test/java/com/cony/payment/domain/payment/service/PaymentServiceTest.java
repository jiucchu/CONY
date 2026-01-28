package com.cony.payment.domain.payment.service;

import com.cony.payment.domain.point.service.PointService;
import com.cony.payment.domain.user.entity.User;
import com.cony.payment.domain.user.enums.OAuthProvider;
import com.cony.payment.domain.user.repository.UserRepository;
import com.cony.payment.infrastructure.kakaopay.dto.KakaoPayReadyResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class PaymentServiceTest {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PointService pointService;

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
    }

    @Test
    @DisplayName("결제 준비 - TID 발급 성공")
    void ready_Success() {
        // given
        Long amount = 10000L;

        // when
        KakaoPayReadyResponse response = paymentService.ready(testUser.getId(), amount);

        // then
        assertThat(response).isNotNull();
        assertThat(response.getTid()).isNotNull();
        assertThat(response.getNextRedirectPcUrl()).isNotNull();
    }
}