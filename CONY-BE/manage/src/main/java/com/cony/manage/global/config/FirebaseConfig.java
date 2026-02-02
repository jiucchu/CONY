package com.cony.manage.global.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import jakarta.annotation.PostConstruct;
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

    @PostConstruct
    public void initialize() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                InputStream serviceAccount;
                
                if (firebaseServiceAccountPath != null && !firebaseServiceAccountPath.isEmpty()) {
                    // 파일 경로로부터 읽기
                    serviceAccount = new FileInputStream(firebaseServiceAccountPath);
                    log.info("Firebase 서비스 계정 파일을 경로에서 읽었습니다: {}", firebaseServiceAccountPath);
                } else {
                    // 클래스패스에서 읽기 (기본값: firebase-service-account.json)
                    ClassPathResource resource = new ClassPathResource("firebase-service-account.json");
                    if (resource.exists()) {
                        serviceAccount = resource.getInputStream();
                        log.info("Firebase 서비스 계정 파일을 클래스패스에서 읽었습니다.");
                    } else {
                        log.warn("Firebase 서비스 계정 파일을 찾을 수 없습니다. FCM 기능이 동작하지 않을 수 있습니다.");
                        return;
                    }
                }

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();

                FirebaseApp.initializeApp(options);
                log.info("Firebase 초기화 완료");
            } else {
                log.info("Firebase가 이미 초기화되어 있습니다.");
            }
        } catch (IOException e) {
            log.error("Firebase 초기화 실패", e);
        }
    }

    @Bean
    public FirebaseMessaging firebaseMessaging() {
        return FirebaseMessaging.getInstance();
    }
}
