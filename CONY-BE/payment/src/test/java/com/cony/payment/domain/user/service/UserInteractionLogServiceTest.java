package com.cony.payment.domain.user.service;

import com.cony.payment.domain.sale.entity.Sale;
import com.cony.payment.domain.sale.dto.SaleRequestDto;
import com.cony.payment.domain.sale.repository.SaleRepository;
import com.cony.payment.domain.sale.service.SaleService;
import com.cony.payment.domain.user.dto.UserInteractionLogRequestDto;
import com.cony.payment.domain.user.dto.UserInteractionLogResponseDto;
import com.cony.payment.domain.user.entity.User;
import com.cony.payment.domain.user.entity.UserInteractionLog;
import com.cony.payment.domain.user.enums.EventType;
import com.cony.payment.domain.user.enums.OAuthProvider;
import com.cony.payment.domain.user.repository.UserInteractionLogRepository;
import com.cony.payment.domain.user.repository.UserRepository;
import com.cony.payment.global.error.CustomException;
import com.cony.payment.global.error.ErrorCode;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class UserInteractionLogServiceTest {

    @Autowired UserInteractionLogService userInteractionLogService;
    @Autowired SaleService saleService;
    @Autowired UserRepository userRepository;
    @Autowired SaleRepository saleRepository;
    @Autowired UserInteractionLogRepository userInteractionLogRepository;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("행동 로그 저장 성공 시 로그가 저장되고 응답 DTO가 반환된다")
    void createInteractionSuccess() {
        // given
        User user = createUser("user@test.com", "테스터");
        Sale sale = createSale(user.getId());
        setAuthenticatedUserId(user.getId());

        UserInteractionLogRequestDto request = new UserInteractionLogRequestDto(sale.getId(), EventType.CLICK);

        // when
        UserInteractionLogResponseDto response = userInteractionLogService.createInteraction(request);

        // then
        assertThat(response.getUserId()).isEqualTo(user.getId());
        assertThat(response.getSaleId()).isEqualTo(sale.getId());
        assertThat(response.getEventType()).isEqualTo(EventType.CLICK);

        List<UserInteractionLog> logs = userInteractionLogRepository.findTop30ByUserIdOrderByCreatedAtDesc(user.getId());
        assertThat(logs).hasSize(1);
        assertThat(logs.get(0).getEventType()).isEqualTo(EventType.CLICK);
    }

    @Test
    @DisplayName("유저가 존재하지 않으면 USER_NOT_FOUND 예외가 발생한다")
    void createInteractionUserNotFound() {
        // given
        User owner = createUser("owner@test.com", "판매자");
        Sale sale = createSale(owner.getId());
        setAuthenticatedUserId(9999L);

        UserInteractionLogRequestDto request = new UserInteractionLogRequestDto(sale.getId(), EventType.CLICK);

        // when & then
        assertThatThrownBy(() -> userInteractionLogService.createInteraction(request))
                .isInstanceOf(CustomException.class)
                .hasMessage(ErrorCode.USER_NOT_FOUND.getMessage());
    }

    @Test
    @DisplayName("세일이 존재하지 않으면 SALE_NOT_FOUND 예외가 발생한다")
    void createInteractionSaleNotFound() {
        // given
        User user = createUser("user2@test.com", "테스터2");
        setAuthenticatedUserId(user.getId());

        UserInteractionLogRequestDto request = new UserInteractionLogRequestDto(9999L, EventType.CLICK);

        // when & then
        assertThatThrownBy(() -> userInteractionLogService.createInteraction(request))
                .isInstanceOf(CustomException.class)
                .hasMessage(ErrorCode.SALE_NOT_FOUND.getMessage());
    }

    @Test
    @DisplayName("최근 30개 조회 시 로그인 유저의 로그가 반환된다")
    void getRecentInteractions() {
        // given
        User user = createUser("recent@test.com", "최신유저");
        Sale sale = createSale(user.getId());
        setAuthenticatedUserId(user.getId());

        userInteractionLogService.createInteraction(new UserInteractionLogRequestDto(sale.getId(), EventType.CLICK));
        userInteractionLogService.createInteraction(new UserInteractionLogRequestDto(sale.getId(), EventType.PURCHASE));

        // when
        List<UserInteractionLogResponseDto> logs = userInteractionLogService.getRecentInteractions();

        // then
        assertThat(logs).hasSize(2);
        assertThat(logs).allMatch(log -> log.getUserId().equals(user.getId()));
        assertThat(logs).extracting(UserInteractionLogResponseDto::getEventType)
                .contains(EventType.CLICK, EventType.PURCHASE);
    }

    private User createUser(String email, String name) {
        User user = User.builder()
                .email(email)
                .name(name)
                .oauthProvider(OAuthProvider.KAKAO)
                .build();
        return userRepository.save(user);
    }

    private Sale createSale(Long sellerId) {
        SaleRequestDto request = SaleRequestDto.builder()
                .gifticonId(123L)
                .originalPrice(10000)
                .salePrice(5000)
                .build();
        Long saleId = saleService.createSale(sellerId, request);
        return saleRepository.findById(saleId).orElseThrow();
    }

    private void setAuthenticatedUserId(Long userId) {
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        String.valueOf(userId),
                        "N/A",
                        List.of(new SimpleGrantedAuthority("ROLE_USER"))
                );
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

}
