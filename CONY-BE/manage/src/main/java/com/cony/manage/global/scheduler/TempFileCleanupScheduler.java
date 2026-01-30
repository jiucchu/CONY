package com.cony.manage.global.scheduler;

import com.cony.manage.infrastructure.image.FileUploader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class TempFileCleanupScheduler {
    private final FileUploader fileUploader; // 인터페이스 주입

    @Async
    @Scheduled(cron = "0 0 4 * * *")
    public void cleanupTempFiles() {
        try {
            log.info(">>>> [Async Start] 임시 파일 정리 스케줄러 시작 <<<<");
            long startTime = System.currentTimeMillis();

            // 실제 로직 (파일 I/O가 발생하여 오래 걸릴 수 있음)
            fileUploader.deleteOldTempFiles(1);

            long duration = System.currentTimeMillis() - startTime;
            log.info(">>>> [Async End] 임시 파일 정리 완료 (소요시간: {}ms)", duration);

        } catch (Exception e) {
            // ★ 중요: Async 메서드(void 반환)에서 예외가 터지면 호출축에서 잡을 수 없으므로
            // 반드시 내부에서 try-catch로 로그를 남겨야 합니다.
            log.error(">>>> [Async Error] 임시 파일 정리 중 오류 발생", e);
        }
    }
}
