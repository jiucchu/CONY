package com.cony.payment.domain.sale.scheduler;

import com.cony.payment.domain.sale.entity.Sale;
import com.cony.payment.domain.sale.enums.SaleStatus;
import com.cony.payment.domain.sale.repository.SaleRepository;
import com.cony.payment.infrastructure.manage.client.ManageClient;
import com.cony.payment.infrastructure.manage.dto.AutoSaleTargetResponse;
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
 *
 * 1. 사용자 직접 설정 자동판매 → 판매 등록 (ON_SALE)
 * 2. 판매 예정일 도래 PENDING Sale → ON_SALE로 변경
 *
 * ※ 유효기간 1달 이내 기프티콘은 자동 등록하지 않음
 *   → 프론트에서 GET /v1/sales/suggestions로 조회 후 사용자 승인 시 등록
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AutoSaleScheduler {

    private final SaleRepository saleRepository;
    private final ManageClient manageClient;

    private static final int DEFAULT_DISCOUNT_RATE = 20; // 기본 할인율 20%

    /**
     * 매일 오전 9시에 자동판매 처리
     * cron = "0 0 9 * * *" -> 매일 오전 9시 실행
     */
    @Scheduled(cron = "0 0 9 * * *")
    public void runAutoSaleProcess() {
        log.info("=== 자동판매 스케줄러 시작: {} ===", LocalDateTime.now());

        // 1. 사용자 직접 설정 자동판매 → 판매 등록
        processUserScheduledGifticons();

        // 2. 판매 예정일 도래한 PENDING Sale → ON_SALE 변경
        processScheduledSales();

        log.info("=== 자동판매 스케줄러 완료: {} ===", LocalDateTime.now());
    }

    /**
     * 1. 사용자 직접 설정 자동판매 처리
     * - 자동 판매 등록 (ON_SALE - 즉시 판매)
     */
    @Transactional
    public void processUserScheduledGifticons() {
        log.info("--- [1단계] 사용자 설정 자동판매 처리 시작 ---");

        List<AutoSaleTargetResponse> targets = manageClient.getAutoSaleTargetsWithoutNotification();

        if (targets.isEmpty()) {
            log.info("사용자 설정 자동판매 대상 없음");
            return;
        }

        log.info("사용자 설정 자동판매 대상: {}건", targets.size());

        int successCount = 0;
        int skipCount = 0;

        for (AutoSaleTargetResponse target : targets) {
            try {
                // 이미 Sale 등록된 기프티콘은 제외
                if (saleRepository.existsByGifticonId(target.getGifticonId())) {
                    log.info("이미 판매 등록됨, 스킵: gifticonId={}", target.getGifticonId());
                    skipCount++;
                    continue;
                }

                // 판매가격 계산 (사용자 설정 or 기본 20% 할인)
                int salePrice = target.getPlannedSalePrice() != null
                        ? target.getPlannedSalePrice()
                        : calculateDefaultSalePrice(target.getOriginalPrice());

                // Sale 등록 (ON_SALE - 즉시 판매)
                Sale sale = Sale.builder()
                        .sellerId(target.getUserId())
                        .gifticonId(target.getGifticonId())
                        .brandId(target.getBrandId())
                        .expiryDate(target.getExpiryDate())
                        .originalPrice(target.getOriginalPrice())
                        .salePrice(salePrice)
                        .build();

                saleRepository.save(sale);

                // Manage 서버에 자동판매 처리 완료 표시
                manageClient.markAutoSaleProcessed(target.getGifticonId());

                successCount++;
                log.info("자동판매 등록 완료: saleId={}, gifticonId={}, userId={}, salePrice={}",
                        sale.getId(), target.getGifticonId(), target.getUserId(), salePrice);

            } catch (Exception e) {
                log.error("자동판매 등록 실패: gifticonId={}", target.getGifticonId(), e);
            }
        }

        log.info("--- [1단계] 사용자 설정 자동판매 완료: 성공={}, 스킵={} ---", successCount, skipCount);
    }

    /**
     * 2. 판매 예정일이 도래한 PENDING Sale 처리
     * - ON_SALE로 변경
     */
    @Transactional
    public void processScheduledSales() {
        log.info("--- [2단계] 예약 판매 시작 처리 ---");

        List<Sale> pendingSales = saleRepository.findPendingSalesReadyToStart(
                SaleStatus.PENDING, LocalDate.now());

        if (pendingSales.isEmpty()) {
            log.info("판매 시작 대상 없음");
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

        log.info("--- [2단계] 예약 판매 시작 완료: 성공={}, 실패={} ---", successCount, failCount);
    }

    /**
     * 기본 판매가격 계산 (20% 할인)
     */
    private int calculateDefaultSalePrice(Integer originalPrice) {
        if (originalPrice == null || originalPrice <= 0) {
            return 0;
        }
        return originalPrice * (100 - DEFAULT_DISCOUNT_RATE) / 100;
    }
}
