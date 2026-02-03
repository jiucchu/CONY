package com.cony.manage.infrastructure.payment.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.payment-server")
public class PaymentServerProperties {

    private String url;

    public String getOnSaleCountUrl(Long userId) {
        return url + "/v1/users/" + userId + "/sales/on-sale/count";
    }

    public String getWithdrawUrl(Long userId) {
        return url + "/v1/users/" + userId + "/withdraw";
    }
}
