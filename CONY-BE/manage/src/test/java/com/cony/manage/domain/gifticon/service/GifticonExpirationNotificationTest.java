package com.cony.manage.domain.gifticon.service;

import com.cony.manage.domain.gifticon.entity.Gifticon;
import com.cony.manage.domain.gifticon.enums.GifticonStatus;
import com.cony.manage.domain.gifticon.repository.GifticonRepository;
import com.cony.manage.domain.user.entity.User;
import com.cony.manage.domain.user.service.FcmNotificationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GifticonExpirationNotificationTest {

        @InjectMocks
        private GifticonServiceImpl gifticonService;

        @Mock
        private GifticonRepository gifticonRepository;

        @Mock
        private FcmNotificationService fcmNotificationService;

        @Test
        @DisplayName("만료 임박 알림: 30일 이내 만료되는 기프티콘이 있으면 알림을 전송한다")
        void sendExpirationNotifications_ShouldSendNotification_WhenExpiringGifticonsExist() {
                // given
                User user1 = User.builder().name("User1").email("user1@example.com").build();
                org.springframework.test.util.ReflectionTestUtils.setField(user1, "id", 1L);

                User user2 = User.builder().name("User2").email("user2@example.com").build();
                org.springframework.test.util.ReflectionTestUtils.setField(user2, "id", 2L);

                // User1의 만료 임박 기프티콘 2개, User2의 만료 임박 기프티콘 1개
                Gifticon g1 = Gifticon.builder().user(user1).expiryDate(LocalDate.now().plusDays(5))
                                .status(GifticonStatus.NOT_USED).build();
                Gifticon g2 = Gifticon.builder().user(user1).expiryDate(LocalDate.now().plusDays(29))
                                .status(GifticonStatus.NOT_USED).build();
                Gifticon g3 = Gifticon.builder().user(user2).expiryDate(LocalDate.now().plusDays(1))
                                .status(GifticonStatus.NOT_USED).build();

                List<Gifticon> expiringGifticons = Arrays.asList(g1, g2, g3);

                when(gifticonRepository.findByExpiryDateBetweenAndStatus(any(LocalDate.class), any(LocalDate.class),
                                eq(GifticonStatus.NOT_USED)))
                                .thenReturn(expiringGifticons);

                // when
                gifticonService.sendExpirationNotifications();

                // then
                // User1에게 2개 알림
                verify(fcmNotificationService).sendGifticonExpiryNotification(eq(1L), contains("2개"));
                // User2에게 1개 알림
                verify(fcmNotificationService).sendGifticonExpiryNotification(eq(2L), contains("1개"));
        }

        @Test
        @DisplayName("만료 임박 알림: 만료되는 기프티콘이 없으면 알림을 보내지 않는다")
        void sendExpirationNotifications_ShouldNotSendNotification_WhenNoExpiringGifticons() {
                // given
                when(gifticonRepository.findByExpiryDateBetweenAndStatus(any(LocalDate.class), any(LocalDate.class),
                                eq(GifticonStatus.NOT_USED)))
                                .thenReturn(Collections.emptyList());

                // when
                gifticonService.sendExpirationNotifications();

                // then
                verify(fcmNotificationService, never()).sendGifticonExpiryNotification(anyLong(), anyString());
        }
}
