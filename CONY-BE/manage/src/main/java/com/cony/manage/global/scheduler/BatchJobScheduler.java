package com.cony.manage.global.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.*;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import com.cony.manage.domain.gifticon.service.GifticonService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class BatchJobScheduler {
    private final JobLauncher jobLauncher;
    private final Job storeCacheJob;
    private final GifticonService gifticonService;

    // 애플리케이션 시작이 완료되면 실행
    @Async
    @EventListener(ApplicationReadyEvent.class)
    public void runCacheWarmUp() {
        try {
            log.info(">>>> [Async Start] Store Cache Warm-up Job Started <<<<");
            long startTime = System.currentTimeMillis();

            // JobParameter에 시간을 넣지 않으면, 배치는 동일한 Job으로 인식하여 두 번 실행 x
            // 매번 실행하게 하려면 시간을 파라미터로 추가
            JobParameters jobParameters = new JobParametersBuilder()
                    .addLong("time", System.currentTimeMillis())
                    .toJobParameters();

            JobExecution execution = jobLauncher.run(storeCacheJob, jobParameters);

            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;

            if (execution.getStatus() == BatchStatus.COMPLETED) {
                log.info(">>>> [Batch Finished] Status: {}, Duration: {}ms", execution.getStatus(), duration);
            } else {
                log.error(">>>> [Batch Failed] Status: {}, Duration: {}ms, ExitDescription: {}",
                        execution.getStatus(), duration, execution.getExitStatus().getExitDescription());
            }
        } catch (Exception e) {
            log.error(">>>> [Batch Exception] Failed to execute cache warm-up job", e);
        }
    }

    /**
     * 매일 오전 10시에 기프티콘 유효기간 만료 임박 알림 전송
     * - 대상: 유효기간이 2주 or 1달 남은 기프티콘
     */
    @Scheduled(cron = "0 0 10 * * *")
    public void scheduleGifticonExpirationCheck() {
        log.info(">>>> [Scheduled Task] Gifticon Expiration Notification Check Started <<<<");
        try {
            gifticonService.sendExpirationNotifications();
        } catch (Exception e) {
            log.error(">>>> [Scheduled Task ERROR] Failed to send expiration notifications", e);
        }
    }
}
