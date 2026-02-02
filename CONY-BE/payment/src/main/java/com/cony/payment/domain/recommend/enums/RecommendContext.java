package com.cony.payment.domain.recommend.enums;

import java.util.Locale;

public enum RecommendContext {
    MARKET,
    OWNED;

    public static RecommendContext from(String raw) {
        if (raw == null) {
            return null;
        }
        String normalized = raw.trim().toUpperCase(Locale.ROOT);
        for (RecommendContext value : values()) {
            if (value.name().equals(normalized)) {
                return value;
            }
        }
        return null;
    }

    public String toResponseValue() {
        return name().toLowerCase(Locale.ROOT);
    }
}
