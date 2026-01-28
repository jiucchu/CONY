package com.cony.payment.domain.report.service;

import com.cony.payment.domain.report.dto.ReportRequestDto;
import com.cony.payment.domain.report.entity.Report;
import com.cony.payment.domain.report.enums.ReportStatus;
import com.cony.payment.domain.report.repository.ReportRepository;
import com.cony.payment.domain.sale.entity.Sale;
import com.cony.payment.domain.sale.repository.SaleRepository;
import com.cony.payment.domain.user.entity.User;
import com.cony.payment.domain.user.repository.UserRepository;
import com.cony.payment.global.error.CustomException;
import com.cony.payment.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final SaleRepository saleRepository;

    /**
     * [사용자] 신고 접수
     */
    @Transactional
    public Long createReport(Long reporterId, ReportRequestDto request) {
        if (reportRepository.existsBySaleIdAndReporterId(request.getSaleId(), reporterId)) {
            throw new CustomException(ErrorCode.ALREADY_REPORTED);
        }

        Sale sale = saleRepository.findById(request.getSaleId())
                .orElseThrow(() -> new CustomException(ErrorCode.SALE_NOT_FOUND));

        if (sale.getSellerId().equals(reporterId)) {
            throw new CustomException(ErrorCode.CANNOT_REPORT_OWN_SALE);
        }

        Report report = Report.builder()
                .reporterId(reporterId)
                .targetUserId(sale.getSellerId())
                .saleId(request.getSaleId())
                .reason(request.getReason())
                .build();

        reportRepository.save(report);
        return report.getId();
    }

    /**
     * [관리자] 신고 승인 및 처벌 집행
     */
    @Transactional
    public void approveReport(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new CustomException(ErrorCode.REPORT_NOT_FOUND));

        if (report.getStatus() != ReportStatus.PENDING) {
            throw new CustomException(ErrorCode.REPORT_ALREADY_PROCESSED);
        }

        // 신고 승인 및 횟수 증가
        report.accept();

        User targetUser = userRepository.findById(report.getTargetUserId())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        targetUser.increaseReportCount();

        // 횟수에 따른 자동 처벌
        int count = targetUser.getReportCount();

        if (count == 1) {
            targetUser.suspendAccount(7);
            log.info("유저 정지(7일) 처리됨: userId={}", targetUser.getId());
        } else if (count >= 2) {
            targetUser.banAccount();
            log.info("유저 영구 정지 처리됨: userId={}", targetUser.getId());
        }
    }
}