package com.cony.manage.global.auth.userinfo;

import com.cony.manage.domain.user.enums.OAuthProvider;

import java.util.Map;

public record GoogleUserInfo(Map<String, Object> attributes) implements OAuth2UserInfo {
    @Override public String getOauthId() { return String.valueOf(attributes.get("sub")); }
    @Override public String getEmail() { return (String) attributes.get("email"); }
    @Override public String getName() { return (String) attributes.get("name"); }
    @Override public String getProfileImageUrl() { return (String) attributes.get("picture"); }
    @Override public OAuthProvider getProvider() { return OAuthProvider.GOOGLE; }
}
