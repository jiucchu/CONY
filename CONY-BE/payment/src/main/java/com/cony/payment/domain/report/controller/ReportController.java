package com.cony.payment.domain.report.controller;

import com.cony.payment.domain.report.controller.docs.ReportControllerDocs;
import com.cony.payment.domain.report.dto.ReportRequestDto;
import com.cony.payment.domain.report.service.ReportService;
import com.cony.payment.global.auth.annotation.AuthUser;
import com.cony.payment.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController implements ReportControllerDocs {

    private final ReportService reportService;

    @Override
    @PostMapping
    public ApiResponse<Long> createReport(
            @RequestBody ReportRequestDto request,
            @AuthUser Long userId) {
        Long reportId = reportService.createReport(userId, request);
        return ApiResponse.success("신고가 접수되었습니다.", reportId);
    }

    @Override
    @PostMapping("/{reportId}/approve")
    public ApiResponse<Void> approveReport(@PathVariable Long reportId) {
        reportService.approveReport(reportId);
        return ApiResponse.success("신고가 승인되고 처벌이 적용되었습니다.");
    }
}