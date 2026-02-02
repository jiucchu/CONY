package com.cony.manage.global.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Slf4j
@Configuration
public class FirebaseConfig {

    @Value("${firebase.service-account.path:}")
    private String firebaseServiceAccountPath;

    // 1. FirebaseApp을 빈으로 등록 (초기화 로직 이동)
    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        if (!FirebaseApp.getApps().isEmpty()) {
            log.info("Firebase가 이미 초기화되어 있습니다.");
            return FirebaseApp.getInstance();
        }

        InputStream serviceAccount;

        if (firebaseServiceAccountPath != null && !firebaseServiceAccountPath.isEmpty()) {
            // 파일 경로로부터 읽기
            serviceAccount = new FileInputStream(firebaseServiceAccountPath);
            log.info("Firebase 서비스 계정 파일을 경로에서 읽었습니다: {}", firebaseServiceAccountPath);
        } else {
            // 클래스패스에서 읽기
            ClassPathResource resource = new ClassPathResource("firebase-service-account.json");
            if (resource.exists()) {
                serviceAccount = resource.getInputStream();
                log.info("Firebase 서비스 계정 파일을 클래스패스에서 읽었습니다.");
            } else {
                log.error("Firebase 서비스 계정 파일을 찾을 수 없습니다.");
                throw new IOException("Firebase service account file not found");
            }
        }

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();

        FirebaseApp app = FirebaseApp.initializeApp(options);
        log.info("Firebase 초기화 완료");
        return app;
    }

    // 2. 위에서 만든 FirebaseApp 빈을 파라미터로 주입받음 (순서 강제)
    @Bean
    public FirebaseMessaging firebaseMessaging(FirebaseApp firebaseApp) {
        // firebaseApp이 생성된 후에 실행되므로 안전함
        return FirebaseMessaging.getInstance(firebaseApp);
    }
}