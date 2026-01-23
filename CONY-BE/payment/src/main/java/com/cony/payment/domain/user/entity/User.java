package com.cony.payment.domain.user.entity;

import com.cony.payment.domain.user.enums.OAuthProvider;
import com.cony.payment.global.entity.BaseTimeEntity;
import com.cony.payment.global.error.CustomException;
import com.cony.payment.global.error.ErrorCode;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "user")
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
}