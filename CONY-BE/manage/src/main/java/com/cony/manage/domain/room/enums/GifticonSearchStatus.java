package com.cony.manage.domain.room.enums;

import lombok.Getter;

@Getter
public enum GifticonSearchStatus {
    ALL,
    AVAILABLE, // NOT_USED, IN_USE
    USED // USED, EXPIRED
}
