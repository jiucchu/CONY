package com.cony.manage.domain.user.controller.docs;

import com.cony.manage.domain.user.dto.UserDashboardResponseDto;
import com.cony.manage.domain.user.dto.WithdrawalCheckResponseDto;
import com.cony.manage.global.auth.annotation.AuthUser;
import com.cony.manage.global.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "User Controller", description = "마이페이지 API")
public interface UserControllerDocs {

    @Operation(summary = "마이페이지 대시보드 조회", description = "프로필, 포인트, 활동 통계 등 마이페이지 정보를 조회합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증되지 않은 사용자", content = @Content),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "회원을 찾을 수 없음", content = @Content)
    })
    ApiResponse<UserDashboardResponseDto> getDashboard(@AuthUser Long userId);

    @Operation(summary = "탈퇴 가능 여부 확인", description = "회원 탈퇴가 가능한지 확인합니다. 판매 중인 상품이 있거나 공유방 방장인 경우 탈퇴 불가합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "확인 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증되지 않은 사용자", content = @Content),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "회원을 찾을 수 없음", content = @Content)
    })
    ApiResponse<WithdrawalCheckResponseDto> checkWithdrawal(@AuthUser Long userId);

    @Operation(summary = "회원 탈퇴", description = "회원 탈퇴를 처리합니다. 탈퇴 불가 조건이 있으면 실패합니다.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "탈퇴 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "탈퇴 불가 (판매 중인 상품 또는 방장 역할)", content = @Content),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증되지 않은 사용자", content = @Content),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "회원을 찾을 수 없음", content = @Content)
    })
    ApiResponse<Void> withdraw(@AuthUser Long userId);
}
