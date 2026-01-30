package com.cony.payment.domain.report.entity;

import com.cony.payment.domain.report.enums.ReportStatus;
import com.cony.payment.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "report", uniqueConstraints = {
        @UniqueConstraint(name = "uk_report_sale_reporter", columnNames = {"sale_id", "reporter_id"})
})
public class Report extends BaseTimeEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long id;

    @Column(nullable = false)
    private Long reporterId;    // 신고자

    @Column(nullable = false)
    private Long targetUserId;  // 신고 대상자 (판매자)

    @Column(nullable = false)
    private Long saleId;        // 문제의 판매글

    @Column(nullable = false)
    private String reason;      // 신고 사유

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportStatus status;

    @Builder
    public Report(Long reporterId, Long targetUserId, Long saleId, String reason) {
        this.reporterId = reporterId;
        this.targetUserId = targetUserId;
        this.saleId = saleId;
        this.reason = reason;
        this.status = ReportStatus.PENDING;
    }

    // 관리자 승인 처리
    public void accept() {
        this.status = ReportStatus.ACCEPTED;
    }

    // 관리자 반려 처리
    public void reject() {
        this.status = ReportStatus.REJECTED;
    }
}