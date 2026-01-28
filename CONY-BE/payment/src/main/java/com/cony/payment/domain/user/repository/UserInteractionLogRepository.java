package com.cony.payment.domain.user.repository;

import com.cony.payment.domain.user.entity.UserInteractionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserInteractionLogRepository extends JpaRepository<UserInteractionLog, Long> {
    // userID로 해당 유저의 최근 30개 행동 로그 조회
    List<UserInteractionLog> findTop30ByUserIdOrderByCreatedAtDesc(Long userId);
}
