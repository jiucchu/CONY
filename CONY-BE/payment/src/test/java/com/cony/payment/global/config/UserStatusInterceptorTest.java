package com.cony.payment.global.config;

import com.cony.payment.domain.user.entity.User;
import com.cony.payment.domain.user.enums.UserStatus;
import com.cony.payment.domain.user.repository.UserRepository;
import com.cony.payment.global.error.CustomException;
import com.cony.payment.global.error.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserStatusInterceptorTest {

    @Mock
    UserRepository userRepository;

    @Mock
    HttpServletRequest request;

    @Mock
    HttpServletResponse response;

    @InjectMocks
    UserStatusInterceptor userStatusInterceptor;

    @Test
    @DisplayName("정상 사용자는 통과해야 한다")
    void activeUserPassTest() {
        // given
        when(request.getParameter("userId")).thenReturn("1");
        User user = User.builder().email("test@test.com").name("Test").build();
        // 기본 상태는 ACTIVE
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        // when
        boolean result = userStatusInterceptor.preHandle(request, response, new Object());

        // then
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("정지된 사용자는 예외가 발생해야 한다")
    void suspendedUserFailTest() {
        // given
        when(request.getParameter("userId")).thenReturn("1");
        User user = User.builder().email("test@test.com").name("Test").build();
        user.suspendAccount(7); // SUSPENDED 상태로 변경
        
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        // when & then
        assertThatThrownBy(() -> userStatusInterceptor.preHandle(request, response, new Object()))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_SUSPENDED);
    }
}
