package com.cony.manage.global.auth.userinfo;

import com.cony.manage.domain.user.enums.OAuthProvider;

public interface OAuth2UserInfo {
    String getOauthId();
    String getEmail();
    String getName();
    String getProfileImageUrl();
    OAuthProvider getProvider();
}
