package com.cony.payment.infrastructure.manage.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.manage-server")
public class ManageServerProperties {

    private String url;

    public String getGifticonUrl(Long gifticonId) {
        return url + "/v1/gifticons/" + gifticonId;
    }
}
