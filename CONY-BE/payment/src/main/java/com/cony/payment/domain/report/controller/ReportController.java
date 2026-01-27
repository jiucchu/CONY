package com.cony.payment.domain.report.controller;

import com.cony.payment.domain.report.dto.ReportRequestDto;
import com.cony.payment.domain.report.service.ReportService;
import com.cony.payment.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    // 신고 접수
    @PostMapping
    public ApiResponse<Long> createReport(
            @RequestParam Long userId,
            @RequestBody ReportRequestDto request) {

        Long reportId = reportService.createReport(userId, request);
        return ApiResponse.success("신고가 접수되었습니다.", reportId);
    }

    // [관리자용] 신고 승인 (테스트용 API)
    @PostMapping("/{reportId}/approve")
    public ApiResponse<Void> approveReport(@PathVariable Long reportId) {
        reportService.approveReport(reportId);
        return ApiResponse.success("신고가 승인되고 처벌이 적용되었습니다.");
    }
}