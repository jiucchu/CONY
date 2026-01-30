package com.cony.manage.global.auth.userinfo;

import com.cony.manage.domain.user.enums.OAuthProvider;

import java.util.Map;

public record KakaoUserInfo(Map<String, Object> attributes) implements OAuth2UserInfo {
    @Override
    public String getOauthId() { return String.valueOf(attributes.get("id")); }

    @Override
    public String getEmail() {
        Map<String, Object> account = (Map<String, Object>) attributes.get("kakao_account");
        return account != null ? (String) account.get("email") : null;
    }

    @Override
    public String getName() {
        Map<String, Object> account = (Map<String, Object>) attributes.get("kakao_account");
        if (account == null) return null;
        Map<String, Object> profile = (Map<String, Object>) account.get("profile");
        return profile != null ? (String) profile.get("nickname") : null;
    }

    @Override
    public String getProfileImageUrl() {
        Map<String, Object> account = (Map<String, Object>) attributes.get("kakao_account");
        if (account == null) return null;
        Map<String, Object> profile = (Map<String, Object>) account.get("profile");
        return profile != null ? (String) profile.get("thumbnail_image_url") : null;
    }

    @Override public OAuthProvider getProvider() { return OAuthProvider.KAKAO; }
}
