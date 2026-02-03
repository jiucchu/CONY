package com.cony.payment.domain.user.entity;

import com.cony.payment.domain.user.enums.OAuthProvider;
import com.cony.payment.domain.user.enums.UserStatus;
import com.cony.payment.global.entity.BaseTimeEntity;
import com.cony.payment.global.error.CustomException;
import com.cony.payment.global.error.ErrorCode;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "users")
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    private OAuthProvider oauthProvider;

    private String oauthId;
    private String profileImageUrl;

    @Column(nullable = false)
    private Long pointBalance = 0L;  // 기본값 0

    @Column(nullable = false)
    private int reportCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status = UserStatus.ACTIVE; // 계정 상태 (ACTIVE, SUSPENDED, BANNED)

    private LocalDateTime suspensionEndAt; // 정지 해제일(영구정지 -> null)

    private LocalDateTime withdrawnAt; // 탈퇴 일시

    @Builder
    public User(String email, String name, OAuthProvider oauthProvider, String oauthId, String profileImageUrl) {
        this.email = email;
        this.name = name;
        this.oauthProvider = oauthProvider;
        this.oauthId = oauthId;
        this.profileImageUrl = profileImageUrl;
        this.pointBalance = 0L;
    }

    /**
     * 포인트 충전
     */
    public void chargePoint(Long amount) {
        if (amount == null || amount <= 0) {
            throw new CustomException(ErrorCode.INVALID_POINT_AMOUNT);
        }
        this.pointBalance += amount;
    }

    /**
     * 포인트 차감
     */
    public void deductPoint(Long amount) {
        if (amount == null || amount <= 0) {
            throw new CustomException(ErrorCode.INVALID_POINT_AMOUNT);
        }
        if (this.pointBalance < amount) {
            throw new CustomException(ErrorCode.INSUFFICIENT_POINTS);
        }
        this.pointBalance -= amount;
    }

    /**
     * 신고 횟수
     */
    public void increaseReportCount() {
        this.reportCount++;
    }

    /**
     * 1차 정지 (기간 정지)
     */
    public void suspendAccount(int days) {
        this.status = UserStatus.SUSPENDED;
        this.suspensionEndAt = LocalDateTime.now().plusDays(days);
    }

    /**
     * 2차 정지 (영구 정지)
     */
    public void banAccount() {
        this.status = UserStatus.BANNED;
        this.suspensionEndAt = null;
    }

    public void checkAndUnban() {
        // 영구 정지(BANNED)는 절대 안 풀림 -> 바로 리턴
        if (this.status == UserStatus.BANNED) {
            return;
        }

        // 기간 정지(SUSPENDED) 상태이고 + 만료 시간이 지났다면?
        if (this.status == UserStatus.SUSPENDED
                && this.suspensionEndAt != null
                && LocalDateTime.now().isAfter(this.suspensionEndAt)) {

            this.status = UserStatus.ACTIVE;       // 상태 복구!
            this.suspensionEndAt = null;           // 날짜 초기화
            // (JPA Dirty Checking으로 인해 Transaction이 끝나면 DB에 자동 저장됨)
        }
    }

    /**
     * 회원 탈퇴 처리 (Manage 서버에서 동기화 호출)
     * - 상태를 WITHDRAWN으로 변경
     * - 개인정보 마스킹 처리
     */
    public void withdraw() {
        this.status = UserStatus.WITHDRAWN;
        this.withdrawnAt = LocalDateTime.now();

        // 개인정보 마스킹
        this.name = "탈퇴한 회원";
        this.email = "withdrawn_" + this.id + "@deleted.com";
        this.profileImageUrl = null;
        this.oauthId = null;
    }

    /**
     * 탈퇴 여부 확인
     */
    public boolean isWithdrawn() {
        return this.status == UserStatus.WITHDRAWN;
    }

}