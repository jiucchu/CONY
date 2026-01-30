package com.cony.manage.domain.room.controller;

import com.cony.manage.domain.room.dto.request.RoomCreateRequestDto;
import com.cony.manage.domain.room.dto.response.GifticonRoomResponseDto;
import com.cony.manage.domain.room.dto.response.RoomResponseDto;
import com.cony.manage.domain.room.enums.GifticonSearchStatus;
import com.cony.manage.domain.room.service.RoomService;
import com.cony.manage.domain.user.repository.UserRepository;
import com.cony.manage.global.common.ApiResponse;
import com.cony.manage.global.error.CustomException;
import com.cony.manage.global.error.ErrorCode;
import com.cony.manage.global.util.AuthUtil;
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
public class RoomController {

    private final RoomService roomService;
    private final UserRepository userRepository;

    // 현재 인증된 사용자의 ID를 조회합니다.
    private Long getCurrentUserId() {
        String email = AuthUtil.getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(
                        ErrorCode.USER_NOT_FOUND))
                .getId();
    }

    // 내 방 목록을 조회합니다.
    @GetMapping
    public ApiResponse<List<RoomResponseDto>> getMyRooms() {
        Long userId = getCurrentUserId();
        return ApiResponse.success(roomService.getMyRooms(userId));
    }

    // 새로운 방을 생성합니다.
    @PostMapping
    public ApiResponse<Long> createRoom(@RequestBody RoomCreateRequestDto requestDto) {
        Long userId = getCurrentUserId();
        return ApiResponse.success(roomService.createRoom(userId, requestDto));
    }

    // 방 상세 정보를 조회합니다.
    @GetMapping("/{roomId}")
    public ApiResponse<RoomResponseDto> getRoomDetail(@PathVariable("roomId") Long roomId) {
        Long userId = getCurrentUserId();
        return ApiResponse.success(roomService.getRoomDetail(userId, roomId));
    }

    // 방 내 기프티콘 목록을 조회합니다.
    @GetMapping("/{roomId}/gifticons")
    public ApiResponse<Page<GifticonRoomResponseDto>> getGifticonsInRoom(
            @PathVariable("roomId") Long roomId,
            @RequestParam(required = false, defaultValue = "ALL") GifticonSearchStatus status,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10, sort = "expiryDate", direction = Sort.Direction.ASC) Pageable pageable) {
        Long userId = getCurrentUserId();
        return ApiResponse.success(roomService.getGifticonsInRoom(userId, roomId, status, keyword, pageable));
    }
}
