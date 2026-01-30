package com.cony.payment.domain.point.controller;

import com.cony.payment.domain.point.controller.docs.PointControllerDocs;
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
public class PointController implements PointControllerDocs {

    private final PointService pointService;

    @Override
    @GetMapping
    public ApiResponse<PointResponse> getPointBalance() {
        Long testUserId = 1L;
        log.info("포인트 잔액 조회 (테스트): userId={}", testUserId);

        Long balance = pointService.getPointBalance(testUserId);

        PointResponse response = PointResponse.builder()
                .userId(testUserId)
                .pointBalance(balance)
                .build();

        return ApiResponse.success(response);
    }
}