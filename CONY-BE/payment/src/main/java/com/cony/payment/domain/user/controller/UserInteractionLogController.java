package com.cony.payment.domain.user.controller;

import com.cony.payment.domain.user.dto.UserInteractionLogRequestDto;
import com.cony.payment.domain.user.dto.UserInteractionLogResponseDto;
import com.cony.payment.domain.user.service.UserInteractionLogService;
import com.cony.payment.global.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/interactions")
@RequiredArgsConstructor
public class UserInteractionLogController {

    private final UserInteractionLogService userInteractionLogService;

    @PostMapping
    public ApiResponse<UserInteractionLogResponseDto> createInteraction(
            @RequestBody @Valid UserInteractionLogRequestDto requestDto
    ) {
        UserInteractionLogResponseDto response = userInteractionLogService.createInteraction(requestDto);
        return ApiResponse.success("행동 로그가 저장되었습니다.", response);
    }

    @GetMapping("/recent")
    public ApiResponse<List<UserInteractionLogResponseDto>> getRecentInteractions() {
        List<UserInteractionLogResponseDto> logs = userInteractionLogService.getRecentInteractions();
        return ApiResponse.success("최근 행동 로그를 조회했습니다.", logs);
    }
}
