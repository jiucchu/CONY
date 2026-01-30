package com.cony.payment.domain.user.repository;

import com.cony.payment.domain.user.entity.User;
import com.cony.payment.domain.user.enums.UserStatus;
import com.cony.payment.domain.user.enums.OAuthProvider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 이메일로 사용자 조회
     */
    Optional<User> findByEmail(String email);

    /**
     * OAuth ID와 Provider로 사용자 조회
     */
    Optional<User> findByOauthIdAndOauthProvider(String oauthId, OAuthProvider oauthProvider);

    /**
     * 상태와 정지 종료일로 사용자 조회
     */
    List<User> findByStatusAndSuspensionEndAtBefore(UserStatus status, LocalDateTime now);
}