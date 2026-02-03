package com.cony.manage.domain.user.controller;

import com.cony.manage.domain.user.controller.docs.UserControllerDocs;
import com.cony.manage.domain.user.dto.UserDashboardResponseDto;
import com.cony.manage.domain.user.dto.WithdrawalCheckResponseDto;
import com.cony.manage.domain.user.service.UserService;
import com.cony.manage.global.auth.annotation.AuthUser;
import com.cony.manage.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/users/me")
@RequiredArgsConstructor
public class UserController implements UserControllerDocs {

    private final UserService userService;

    @Override
    @GetMapping("/dashboard")
    public ApiResponse<UserDashboardResponseDto> getDashboard(@AuthUser Long userId) {
        UserDashboardResponseDto dashboard = userService.getDashboard(userId);
        return ApiResponse.success("마이페이지 정보를 조회했습니다.", dashboard);
    }

    @Override
    @GetMapping("/withdrawal-check")
    public ApiResponse<WithdrawalCheckResponseDto> checkWithdrawal(@AuthUser Long userId) {
        WithdrawalCheckResponseDto result = userService.checkWithdrawal(userId);
        return ApiResponse.success("탈퇴 가능 여부를 확인했습니다.", result);
    }

    @Override
    @DeleteMapping
    public ApiResponse<Void> withdraw(@AuthUser Long userId) {
        userService.withdraw(userId);
        return ApiResponse.success("회원 탈퇴가 완료되었습니다.");
    }
}
