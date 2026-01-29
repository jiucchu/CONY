package com.cony.manage.domain.room.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum RoomType {
    DEFAULT("기본 쿠폰함"),
    SHARED("공유 쿠폰함");

    private final String description;
}
