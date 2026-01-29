package com.cony.manage.domain.room.controller;

import com.cony.manage.domain.room.dto.request.RoomCreateRequestDto;
import com.cony.manage.domain.room.dto.response.GifticonRoomResponseDto;
import com.cony.manage.domain.room.dto.response.RoomResponseDto;
import com.cony.manage.domain.room.service.RoomService;
import com.cony.manage.global.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/rooms")
public class RoomController {

    private final RoomService roomService;
    private final com.cony.manage.domain.user.repository.UserRepository userRepository;

    private Long getCurrentUserId() {
        String email = AuthUtil.getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new com.cony.manage.global.error.CustomException(
                        com.cony.manage.global.error.ErrorCode.USER_NOT_FOUND))
                .getId();
    }

    @GetMapping
    public ResponseEntity<List<RoomResponseDto>> getMyRooms() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(roomService.getMyRooms(userId));
    }

    @PostMapping
    public ResponseEntity<Long> createRoom(@RequestBody RoomCreateRequestDto requestDto) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(roomService.createRoom(userId, requestDto));
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<RoomResponseDto> getRoomDetail(@PathVariable("roomId") Long roomId) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(roomService.getRoomDetail(userId, roomId));
    }

    @GetMapping("/{roomId}/gifticons")
    public ResponseEntity<Page<GifticonRoomResponseDto>> getGifticonsInRoom(
            @PathVariable("roomId") Long roomId,
            @RequestParam(required = false, defaultValue = "ALL") com.cony.manage.domain.room.enums.GifticonSearchStatus status,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10, sort = "expiryDate", direction = Sort.Direction.ASC) Pageable pageable) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(roomService.getGifticonsInRoom(userId, roomId, status, keyword, pageable));
    }
}
