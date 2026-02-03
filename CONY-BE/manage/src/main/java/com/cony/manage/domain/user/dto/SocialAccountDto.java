package com.cony.manage.domain.user.dto;

import com.cony.manage.domain.user.enums.OAuthProvider;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class SocialAccountDto {
    private String provider;       // KAKAO, GOOGLE, APPLE
    private String providerName;   // Kakao, Google, Apple
    private boolean connected;

    public static SocialAccountDto from(OAuthProvider oauthProvider) {
        if (oauthProvider == null) {
            return SocialAccountDto.builder()
                    .provider(null)
                    .providerName(null)
                    .connected(false)
                    .build();
        }

        String providerName = switch (oauthProvider) {
            case KAKAO -> "Kakao";
            case GOOGLE -> "Google";
            case APPLE -> "Apple";
        };

        return SocialAccountDto.builder()
                .provider(oauthProvider.name())
                .providerName(providerName)
                .connected(true)
                .build();
    }
}
