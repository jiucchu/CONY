package com.cony.payment.domain.sale.scheduler;

import com.cony.payment.domain.sale.entity.Sale;
import com.cony.payment.domain.sale.enums.SaleStatus;
import com.cony.payment.domain.sale.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 자동판매 스케줄러
 * - 판매 예정일이 도래한 PENDING Sale을 ON_SALE로 변경
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AutoSaleScheduler {

    private final SaleRepository saleRepository;

    /**
     * 매일 오전 9시에 자동판매 처리
     * cron = "0 0 9 * * *" -> 매일 오전 9시 실행
     *
     * - 판매 예정일(scheduledSaleDate)이 도래한 PENDING Sale → ON_SALE로 변경
     */
    @Scheduled(cron = "0 0 9 * * *")
    @Transactional
    public void processScheduledSales() {
        log.info("=== 자동판매 스케줄러 시작: {} ===", LocalDateTime.now());

        List<Sale> pendingSales = saleRepository.findPendingSalesReadyToStart(
                SaleStatus.PENDING, LocalDate.now());

        if (pendingSales.isEmpty()) {
            log.info("판매 시작 대상 없음");
            log.info("=== 자동판매 스케줄러 완료: {} ===", LocalDateTime.now());
            return;
        }

        log.info("판매 시작 대상: {}건", pendingSales.size());

        int successCount = 0;
        int failCount = 0;

        for (Sale sale : pendingSales) {
            try {
                sale.startSale();
                log.info("판매 시작 완료: saleId={}, gifticonId={}, scheduledDate={}",
                        sale.getId(), sale.getGifticonId(), sale.getScheduledSaleDate());
                successCount++;
            } catch (Exception e) {
                log.error("판매 시작 실패: saleId={}", sale.getId(), e);
                failCount++;
            }
        }

        log.info("=== 자동판매 스케줄러 완료: {} (성공: {}, 실패: {}) ===",
                LocalDateTime.now(), successCount, failCount);
    }
}
