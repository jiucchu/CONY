package com.cony.payment.domain.user.scheduler;

import com.cony.payment.domain.user.entity.User;
import com.cony.payment.domain.user.enums.UserStatus;
import com.cony.payment.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class  UserSuspensionScheduler {

    private final UserRepository userRepository;

    /**
     * 매일 자정(00:00)에 정지 기간이 만료된 사용자를 찾아 정지를 해제합니다.
     * cron = "0 0 0 * * *" -> 매일 자정 실행
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void unbanExpiredUsers() {
        log.info("정지 해제 스케줄러 실행: {}", LocalDateTime.now());

        List<User> suspendedUsers = userRepository.findByStatusAndSuspensionEndAtBefore(
                UserStatus.SUSPENDED, LocalDateTime.now());

        for (User user : suspendedUsers) {
            user.checkAndUnban(); // 상태 변경 (ACTIVE)
            log.info("사용자 정지 자동 해제: userId={}, email={}", user.getId(), user.getEmail());
        }

        if (!suspendedUsers.isEmpty()) {
            log.info("총 {}명의 사용자 정지가 해제되었습니다.", suspendedUsers.size());
        }
    }
}
