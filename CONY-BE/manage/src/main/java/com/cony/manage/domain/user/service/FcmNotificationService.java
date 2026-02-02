package com.cony.manage.domain.user.service;

import com.cony.manage.domain.user.entity.User;
import com.cony.manage.domain.user.repository.UserRepository;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FcmNotificationService {

    private final FirebaseMessaging firebaseMessaging;
    private final UserRepository userRepository;

    /**
     * 특정 사용자에게 알림 전송
     */
    public void sendNotificationToUser(Long userId, String title, String body) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (user.getFcmToken() == null || user.getFcmToken().isEmpty()) {
            log.warn("사용자 {}의 FCM 토큰이 없습니다.", userId);
            return;
        }

        sendNotification(user.getFcmToken(), title, body);
    }

    /**
     * 여러 사용자에게 알림 전송
     */
    public void sendNotificationToUsers(List<Long> userIds, String title, String body) {
        List<User> users = userRepository.findAllById(userIds);
        
        for (User user : users) {
            if (user.getFcmToken() != null && !user.getFcmToken().isEmpty()) {
                sendNotification(user.getFcmToken(), title, body);
            }
        }
    }

    /**
     * FCM 토큰으로 직접 알림 전송
     */
    public void sendNotification(String fcmToken, String title, String body) {
        try {
            Message message = Message.builder()
                    .setToken(fcmToken)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .build();

            String response = firebaseMessaging.send(message);
            log.info("FCM 알림 전송 성공: {}", response);
        } catch (FirebaseMessagingException e) {
            log.error("FCM 알림 전송 실패: {}", e.getMessage(), e);
            throw new RuntimeException("알림 전송에 실패했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * 지오펜스 알림 전송 (매장 근처 접근 시)
     */
    public void sendGeofenceNotification(Long userId, String storeName) {
        String title = "근처 매장 발견";
        String body = String.format("%s 근처에 있습니다. 쿠폰을 확인해보세요!", storeName);
        sendNotificationToUser(userId, title, body);
    }
}
