import { useState, useEffect, useCallback } from 'react';
import { geofenceNotificationService } from '@/services/geofenceNotificationService';

/**
 * 백그라운드 Geofence 알림을 관리하는 커스텀 훅 (React Native)
 * 
 * 사용 예시:
 * ```tsx
 * const { 
 *   isEnabled, 
 *   hasPermission, 
 *   start, 
 *   stop, 
 *   requestPermission 
 * } = useGeofenceNotification();
 * 
 * // 시작
 * await start();
 * 
 * // 중지
 * stop();
 * ```
 */
export const useGeofenceNotification = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 권한 상태 확인
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const permission = await geofenceNotificationService.requestNotificationPermission();
        setHasPermission(permission);
      } catch (err) {
        setHasPermission(false);
      }
    };

    checkPermission();
    
    // 상태 업데이트를 위한 주기적 체크
    const interval = setInterval(() => {
      const status = geofenceNotificationService.getStatus();
      setIsEnabled(status.enabled);
      setHasPermission(status.hasPermission);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /**
   * 알림 권한 요청
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await geofenceNotificationService.requestNotificationPermission();
      setHasPermission(granted);
      return granted;
    } catch (err: any) {
      setError(err.message || '알림 권한 요청에 실패했습니다.');
      return false;
    }
  }, []);

  /**
   * 백그라운드 알림 시작
   */
  const start = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // 권한 확인
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          throw new Error('알림 권한이 필요합니다. 앱 설정에서 알림을 허용해주세요.');
        }
      }

      await geofenceNotificationService.start();
      setIsEnabled(true);
    } catch (err: any) {
      setError(err.message || '백그라운드 알림 시작에 실패했습니다.');
      setIsEnabled(false);
    } finally {
      setLoading(false);
    }
  }, [hasPermission, requestPermission]);

  /**
   * 백그라운드 알림 중지
   */
  const stop = useCallback((): void => {
    geofenceNotificationService.stop();
    setIsEnabled(false);
    setError(null);
  }, []);

  /**
   * 알림 상태 초기화 (새로운 위치로 이동했을 때)
   */
  const resetNotifications = useCallback((): void => {
    geofenceNotificationService.resetNotifications();
  }, []);

  return {
    isEnabled,
    hasPermission,
    error,
    loading,
    start,
    stop,
    requestPermission,
    resetNotifications,
  };
};
