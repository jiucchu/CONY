package com.cony.payment.domain.report.repository;

import com.cony.payment.domain.report.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<Report, Long> {
    // 중복 신고 방지용 (이 사람이 이 글을 이미 신고했나?)
    boolean existsBySaleIdAndReporterId(Long saleId, Long reporterId);
}