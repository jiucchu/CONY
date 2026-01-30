package com.cony.manage.domain.room.dto.response;

import com.cony.manage.domain.room.entity.Room;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class RoomResponseDto {
    private Long roomId;
    private String name;
    private int memberCount;
    private List<String> thumbnailUrls;

    public static RoomResponseDto of(Room room, int memberCount, List<String> thumbnailUrls) {
        return RoomResponseDto.builder()
                .roomId(room.getId())
                .name(room.getName())
                .memberCount(memberCount)
                .thumbnailUrls(thumbnailUrls)
                .build();
    }
}
