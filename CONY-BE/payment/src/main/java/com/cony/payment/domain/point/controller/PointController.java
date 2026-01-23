package com.cony.payment.domain.point.controller;

import com.cony.payment.domain.point.dto.PointChargeRequest;
import com.cony.payment.domain.point.dto.PointResponse;
import com.cony.payment.domain.point.service.PointService;
import com.cony.payment.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/points")
public class PointController {

    private final PointService pointService;

    /**
     * 포인트 잔액 조회
     * @param userId 사용자 ID
     * @return 포인트 잔액
     */
    @GetMapping("/{userId}")
    public ApiResponse<PointResponse> getPointBalance(@PathVariable Long userId) {
        log.info("포인트 잔액 조회: userId={}", userId);

        Long balance = pointService.getPointBalance(userId);

        PointResponse response = PointResponse.builder()
                .userId(userId)
                .pointBalance(balance)
                .build();

        return ApiResponse.success(response);
    }
}