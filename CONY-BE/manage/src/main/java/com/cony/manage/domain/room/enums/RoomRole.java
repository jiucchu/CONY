package com.cony.manage.domain.room.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum RoomRole {
    OWNER("방장"),
    MEMBER("일반 멤버");

    private final String description;
}
