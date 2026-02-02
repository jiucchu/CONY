package com.cony.manage.domain.user.entity;

import com.cony.manage.domain.user.enums.OAuthProvider;
import com.cony.manage.domain.user.enums.Role;
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
}
