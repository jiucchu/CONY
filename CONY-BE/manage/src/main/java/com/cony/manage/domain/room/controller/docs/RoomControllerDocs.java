package com.cony.manage.domain.room.controller.docs;

import com.cony.manage.domain.room.dto.request.RoomCreateRequestDto;
import com.cony.manage.domain.room.dto.response.GifticonRoomResponseDto;
import com.cony.manage.domain.room.dto.response.RoomResponseDto;
import com.cony.manage.domain.room.enums.GifticonSearchStatus;
import com.cony.manage.global.auth.annotation.AuthUser;
import com.cony.manage.global.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Tag(name = "Room Controller", description = "공유방 관리 API")
public interface RoomControllerDocs {

    @Operation(summary = "내 방 목록 조회", description = "사용자가 속한 공유방 목록을 조회합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공")
    })
    ApiResponse<List<RoomResponseDto>> getMyRooms(@AuthUser Long userId);

    @Operation(summary = "방 생성", description = "새로운 공유방을 생성합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "생성 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "잘못된 요청", content = @Content),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음", content = @Content)
    })
    ApiResponse<Long> createRoom(
            @RequestBody(description = "방 생성 요청 데이터", required = true) RoomCreateRequestDto requestDto,
            @AuthUser Long userId);

    @Operation(summary = "방 상세 조회", description = "특정 공유방의 상세 정보를 조회합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "접근 권한 없음", content = @Content),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "방을 찾을 수 없음", content = @Content)
    })
    ApiResponse<RoomResponseDto> getRoomDetail(
            @Parameter(description = "방 ID", required = true) @PathVariable("roomId") Long roomId,
            @AuthUser Long userId);

    @Operation(summary = "방 내 기프티콘 목록 조회", description = "공유방에 등록된 기프티콘 목록을 검색 및 페이징하여 조회합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "접근 권한 없음", content = @Content)
    })
    ApiResponse<Page<GifticonRoomResponseDto>> getGifticonsInRoom(
            @Parameter(description = "방 ID", required = true) @PathVariable("roomId") Long roomId,
            @Parameter(description = "기프티콘 상태 필터 (ALL, AVAILABLE, USED)") @RequestParam(required = false, defaultValue = "ALL") GifticonSearchStatus status,
            @Parameter(description = "검색어 (브랜드명, 상품명)") @RequestParam(required = false) String keyword,
            @ParameterObject @PageableDefault(size = 10, sort = "expiryDate", direction = Sort.Direction.ASC) Pageable pageable,
            @AuthUser Long userId);
}
