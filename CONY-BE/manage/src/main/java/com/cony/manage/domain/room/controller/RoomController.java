package com.cony.manage.domain.room.controller;

import com.cony.manage.domain.room.controller.docs.RoomControllerDocs;
import com.cony.manage.domain.room.dto.request.RoomCreateRequestDto;
import com.cony.manage.domain.room.dto.response.GifticonRoomResponseDto;
import com.cony.manage.domain.room.dto.response.RoomResponseDto;
import com.cony.manage.domain.room.enums.GifticonSearchStatus;
import com.cony.manage.domain.room.service.RoomService;
import com.cony.manage.global.auth.annotation.AuthUser;
import com.cony.manage.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/rooms")
public class RoomController implements RoomControllerDocs {

    private final RoomService roomService;

    // 내 방 목록을 조회합니다.
    @GetMapping
    public ApiResponse<List<RoomResponseDto>> getMyRooms(@AuthUser Long userId) {
        return ApiResponse.success(roomService.getMyRooms(userId));
    }

    // 새로운 방을 생성합니다.
    @PostMapping
    public ApiResponse<Long> createRoom(@RequestBody RoomCreateRequestDto requestDto, @AuthUser Long userId) {
        return ApiResponse.success(roomService.createRoom(userId, requestDto));
    }

    // 방 상세 정보를 조회합니다.
    @GetMapping("/{roomId}")
    public ApiResponse<RoomResponseDto> getRoomDetail(@PathVariable("roomId") Long roomId, @AuthUser Long userId) {
        return ApiResponse.success(roomService.getRoomDetail(userId, roomId));
    }

    // 방 내 기프티콘 목록을 조회합니다.
    @GetMapping("/{roomId}/gifticons")
    public ApiResponse<Page<GifticonRoomResponseDto>> getGifticonsInRoom(
            @PathVariable("roomId") Long roomId,
            @RequestParam(required = false, defaultValue = "ALL") GifticonSearchStatus status,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10, sort = "expiryDate", direction = Sort.Direction.ASC) Pageable pageable,
            @AuthUser Long userId) {
        return ApiResponse.success(roomService.getGifticonsInRoom(userId, roomId, status, keyword, pageable));
    }
}
