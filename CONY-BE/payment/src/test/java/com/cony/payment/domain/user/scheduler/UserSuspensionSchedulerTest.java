package com.cony.payment.domain.user.scheduler;

import com.cony.payment.domain.user.entity.User;
import com.cony.payment.domain.user.enums.UserStatus;
import com.cony.payment.domain.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserSuspensionSchedulerTest {

    @Mock
    UserRepository userRepository;

    @InjectMocks
    UserSuspensionScheduler userSuspensionScheduler;

    @Test
    @DisplayName("정지 기간이 지난 사용자는 ACTIVE 상태로 변경되어야 한다")
    void unbanExpiredUsersTest() {
        // given
        User suspendedUser = User.builder()
                .email("suspended@test.com")
                .name("Suspended User")
                .build();
        
        // 1일 전으로 정지 시작 -> 이미 만료됨
        suspendedUser.suspendAccount(-1); 
        
        // Mock Repository Behavior
        when(userRepository.findByStatusAndSuspensionEndAtBefore(eq(UserStatus.SUSPENDED), any(LocalDateTime.class)))
                .thenReturn(List.of(suspendedUser));

        // when
        userSuspensionScheduler.unbanExpiredUsers();

        // then
        assertThat(suspendedUser.getStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(suspendedUser.getSuspensionEndAt()).isNull();
    }
    
    @Test
    @DisplayName("정지 기간이 지난 사용자가 없으면 아무 일도 일어나지 않는다")
    void noExpiredUsersTest() {
        // given
        when(userRepository.findByStatusAndSuspensionEndAtBefore(any(), any()))
                .thenReturn(Collections.emptyList());

        // when
        userSuspensionScheduler.unbanExpiredUsers();

        // then
        // 에러 없이 종료됨을 확인
        verify(userRepository, times(1)).findByStatusAndSuspensionEndAtBefore(any(), any());
    }
}