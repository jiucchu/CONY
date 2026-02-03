package com.cony.manage.domain.user.entity;

import com.cony.manage.domain.user.enums.OAuthProvider;
import com.cony.manage.domain.user.enums.Role;
import com.cony.manage.domain.user.enums.UserStatus;
import com.cony.manage.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "USERS")
public class User extends BaseTimeEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;
    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "oauth_provider")
    private OAuthProvider oauthProvider;

    @Column(name = "oauth_id")
    private String oauthId;

    private String profileImageUrl;
    private Long pointBalance;
    
    @Column(name = "fcm_token", length = 500)
    private String fcmToken;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status = UserStatus.ACTIVE;

    private LocalDateTime withdrawnAt;

    @Builder
    public User(String name, String email, String profileImageUrl, Role role, OAuthProvider oauthProvider, String oauthId) {
        this.name = name;
        this.email = email;
        this.profileImageUrl = profileImageUrl;
        this.role = (role == null) ? Role.USER : role;
        this.oauthProvider = oauthProvider;
        this.oauthId = oauthId;
        this.pointBalance = 0L;
    }

    public User update(String name, String profileImageUrl, String oauthId, OAuthProvider oauthProvider) {
        this.name = name;
        this.profileImageUrl = profileImageUrl;

        if (this.oauthId == null) this.oauthId = oauthId;
        if (this.oauthProvider == null) this.oauthProvider = oauthProvider;

        if (this.role == Role.GUEST) this.role = Role.USER;

        return this;
    }

    public String getRoleKey() {
        return this.role.name();
    }

    /**
     * FCM 토큰 업데이트
     */
    public void updateFcmToken(String fcmToken) {
        this.fcmToken = fcmToken;
    }

    /**
     * 회원 탈퇴 처리
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
        this.fcmToken = null;
    }

    /**
     * 탈퇴 여부 확인
     */
    public boolean isWithdrawn() {
        return this.status == UserStatus.WITHDRAWN;
    }
}
