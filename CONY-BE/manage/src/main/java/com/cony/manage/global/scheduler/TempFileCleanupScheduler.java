package com.cony.manage.global.scheduler;

import com.cony.manage.infrastructure.image.FileUploader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class TempFileCleanupScheduler {
    private final FileUploader fileUploader; // 인터페이스 주입

    @Scheduled(cron = "0 0 4 * * *")
    public void cleanupTempFiles() {
        log.info("임시 파일 정리 시작...");

        fileUploader.deleteOldTempFiles(1);
    }
}
