package com.cony.manage.domain.room.dto.response;

import com.cony.manage.domain.room.entity.Room;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@Schema(description = "방 조회 응답")
public class RoomResponseDto {
    @Schema(description = "방 ID", example = "1")
    private Long roomId;

    @Schema(description = "방 이름", example = "친구 모임")
    private String name;

    @Schema(description = "방 참여 코드", example = "a1b2c3d4")
    private String roomCode;

    @Schema(description = "멤버 수", example = "5")
    private int memberCount;

    @Schema(description = "썸네일 URL 목록 (최대 4개)")
    private List<String> thumbnailUrls;

    public static RoomResponseDto of(Room room, int memberCount, List<String> thumbnailUrls) {
        return RoomResponseDto.builder()
                .roomId(room.getId())
                .name(room.getName())
                .roomCode(room.getRoomCode())
                .memberCount(memberCount)
                .thumbnailUrls(thumbnailUrls)
                .build();
    }
}
