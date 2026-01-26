package com.cony.manage.global.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class BatchJobScheduler {
    private final JobLauncher jobLauncher;
    private final Job storeCacheJob;

    // 애플리케이션 시작이 완료되면 실행
    @EventListener(ApplicationReadyEvent.class)
    public void runCacheWarmUp() {
        try {
            log.info(">>>> Start Store Cache Warm-up Job <<<<");

            // JobParameter에 시간을 넣지 않으면, 배치는 동일한 Job으로 인식하여 두 번 실행 x
            // 매번 실행하게 하려면 시간을 파라미터로 추가
            JobParameters jobParameters = new JobParametersBuilder()
                    .addLong("time", System.currentTimeMillis())
                    .toJobParameters();

            jobLauncher.run(storeCacheJob, jobParameters);
        } catch (Exception e) {
            log.error("Failed to execute cache warm-up job", e);
        }
    }
}
