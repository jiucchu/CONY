package com.cony.manage.domain.user.entity;

import com.cony.manage.domain.user.enums.OAuthProvider;
import com.cony.manage.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
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
    private OAuthProvider oAuthProvider;
    private String oAuthId;

    private String profileImageUrl;
    private Long pointBalance;
}
