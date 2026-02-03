package com.cony.manage.domain.user.dto;

import com.cony.manage.domain.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class UserDashboardResponseDto {
    private String name;
    private String email;
    private String profileImageUrl;
    private Long pointBalance;
    private UserActivityStatsDto stats;
    private SocialAccountDto socialAccount;

    public static UserDashboardResponseDto of(User user, UserActivityStatsDto stats) {
        return UserDashboardResponseDto.builder()
                .name(user.getName())
                .email(user.getEmail())
                .profileImageUrl(user.getProfileImageUrl())
                .pointBalance(user.getPointBalance())
                .stats(stats)
                .socialAccount(SocialAccountDto.from(user.getOauthProvider()))
                .build();
    }
}
