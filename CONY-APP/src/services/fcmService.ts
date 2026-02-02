import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';
import { Platform, PermissionsAndroid } from 'react-native';

/**
 * FCM 토큰을 백엔드에 등록
 */
async function registerFcmTokenToBackend(token: string): Promise<void> {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) {
      console.log('[FCM] 로그인되지 않아 토큰 등록을 건너뜁니다.');
      return;
    }

    const response = await fetch(`${API_BASE_URL}/v1/users/fcm-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ fcmToken: token }),
    });

    if (response.ok) {
      console.log('[FCM] 토큰이 백엔드에 등록되었습니다.');
    } else {
      console.error('[FCM] 토큰 등록 실패:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('[FCM] 토큰 등록 중 오류:', error);
  }
}

/**
 * FCM 알림 권한 요청 (Android)
 */
export async function requestFcmPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error('[FCM] 권한 요청 오류:', err);
      return false;
    }
  }
  // iOS는 자동으로 권한 요청
  const authStatus = await messaging().requestPermission();
  return authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
         authStatus === messaging.AuthorizationStatus.PROVISIONAL;
}

/**
 * FCM 초기화 및 토큰 받기
 */
export async function initializeFCM(): Promise<string | null> {
  try {
    // 알림 권한 요청
    const hasPermission = await requestFcmPermission();
    if (!hasPermission) {
      console.log('[FCM] 알림 권한이 거부되었습니다.');
      return null;
    }

    // FCM 토큰 받기
    const token = await messaging().getToken();
    if (token) {
      console.log('[FCM] 토큰 받기 성공:', token.substring(0, 20) + '...');
      
      // AsyncStorage에 저장
      await AsyncStorage.setItem('fcmToken', token);
      
      // 백엔드에 등록
      await registerFcmTokenToBackend(token);
      
      return token;
    } else {
      console.log('[FCM] 토큰을 받을 수 없습니다.');
      return null;
    }
  } catch (error) {
    console.error('[FCM] 초기화 오류:', error);
    return null;
  }
}

/**
 * FCM 토큰 새로고침 (토큰이 변경되었을 때)
 */
export function setupFCMTokenRefresh(): void {
  messaging().onTokenRefresh(async (token) => {
    console.log('[FCM] 토큰이 새로고침되었습니다:', token.substring(0, 20) + '...');
    await AsyncStorage.setItem('fcmToken', token);
    await registerFcmTokenToBackend(token);
  });
}

/**
 * 백그라운드 메시지 핸들러 설정
 * 앱이 백그라운드에 있을 때 알림을 받으면 호출됨
 */
export function setupBackgroundMessageHandler(): void {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('[FCM] 백그라운드 메시지:', remoteMessage);
    // 백그라운드 알림은 자동으로 표시됨
    // 추가 처리가 필요하면 여기에 작성
  });
}

/**
 * 포그라운드 메시지 핸들러 설정
 * 앱이 포그라운드에 있을 때 알림을 받으면 호출됨
 */
export function setupForegroundMessageHandler(
  onMessage: (message: any) => void
): () => void {
  const unsubscribe = messaging().onMessage(async (remoteMessage) => {
    console.log('[FCM] 포그라운드 메시지:', remoteMessage);
    onMessage(remoteMessage);
  });

  return unsubscribe;
}

/**
 * 알림 탭 핸들러 설정
 * 사용자가 알림을 탭했을 때 호출됨
 */
export function setupNotificationOpenedHandler(
  onNotificationOpened: (message: any) => void
): () => void {
  const unsubscribe = messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log('[FCM] 알림 탭됨 (앱이 백그라운드):', remoteMessage);
    onNotificationOpened(remoteMessage);
  });

  // 앱이 종료된 상태에서 알림을 탭한 경우
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log('[FCM] 알림 탭됨 (앱이 종료됨):', remoteMessage);
        onNotificationOpened(remoteMessage);
      }
    });

  return unsubscribe;
}
