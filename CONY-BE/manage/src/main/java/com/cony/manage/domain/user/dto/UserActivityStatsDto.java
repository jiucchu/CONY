package com.cony.manage.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class UserActivityStatsDto {
    private Long gifticonCount;      // 나의 콘 개수
    private Long sharingRoomCount;   // 공유 중인 방 개수
    private Long onSaleCount;        // 판매 중 개수
}
