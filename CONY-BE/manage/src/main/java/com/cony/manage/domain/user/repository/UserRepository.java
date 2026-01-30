package com.cony.manage.domain.user.repository;

import com.cony.manage.domain.user.entity.User;
import com.cony.manage.domain.user.enums.OAuthProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByOauthIdAndOauthProvider(String oauthId, OAuthProvider oauthProvider);
    Optional<User> findByEmail(String email);
}
