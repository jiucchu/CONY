/**
 * 백그라운드 Geofence 알림 서비스 (React Native)
 * 사용자가 가진 기프티콘의 매장 근처에 있을 때 알림을 보냅니다.
 * 
 * ✅ React Native의 장점:
 * - 완전한 백그라운드 위치 추적 가능
 * - 앱이 종료되어도 백그라운드에서 동작
 * - 네이티브 알림 지원
 * 
 * 필요한 라이브러리:
 * - @react-native-async-storage/async-storage (토큰 저장)
 * - @react-native-community/geolocation 또는 react-native-geolocation-service (위치 추적)
 * - @notifee/react-native 또는 react-native-push-notification (알림)
 * - react-native-background-geolocation (백그라운드 위치 추적, 유료) 또는 BackgroundFetch
 */

import Geolocation from '@react-native-community/geolocation';
import notifee, { AndroidImportance } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNearbyStores } from '@/api/geofence/geofenceApi';
import { getMyGifticons, type GifticonListResponseDto } from '@/api/gifticon/gifticonApi';
import { Platform, AppState, AppStateStatus, PermissionsAndroid } from 'react-native';

interface NotificationState {
  notifiedStores: Set<string>; // 이미 알림을 보낸 매장 ID들
  lastCheckLocation: { lat: number; lon: number } | null;
  lastCheckTime: number;
}

import type { GeofenceRequestDto, GeofenceResponseDto, MapPoint } from '@/types/geofence/geofence';

class GeofenceNotificationService {
  private watchId: number | null = null;
  private checkInterval: NodeJS.Timeout | null = null;
  private notificationState: NotificationState = {
    notifiedStores: new Set(),
    lastCheckLocation: null,
    lastCheckTime: 0,
  };
  private userCoupons: GifticonListResponseDto[] = [];
  private isEnabled = false;
  private checkIntervalMs = 60000; // 1분마다 체크
  private appStateSubscription: any = null;

  /**
   * 알림 권한 요청
   */
  async requestNotificationPermission(): Promise<boolean> {
    try {
      const settings = await notifee.requestPermission();
      return settings.authorizationStatus >= 1; // 1: AUTHORIZED, 2: PROVISIONAL
    } catch (error) {
      console.error('알림 권한 요청 실패:', error);
      return false;
    }
  }

  /**
   * 위치 권한 요청
   */
  async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      // iOS는 Geolocation.requestAuthorization 사용
      return new Promise((resolve) => {
        Geolocation.requestAuthorization(
          () => resolve(true),
          () => resolve(false)
        );
      });
    }

    try {
      // 이미 권한이 있는지 확인
      const fineLocation = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      const coarseLocation = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
      );

      // 포그라운드 위치 권한이 없으면 먼저 요청
      if (!fineLocation && !coarseLocation) {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);

        const hasForegroundPermission = 
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
            PermissionsAndroid.RESULTS.GRANTED ||
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
            PermissionsAndroid.RESULTS.GRANTED;

        if (!hasForegroundPermission) {
          return false;
        }
      }

      // 포그라운드 위치 권한이 있으면 백그라운드 위치 권한 확인 및 요청
      const backgroundLocation = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
      );

      if (!backgroundLocation) {
        // Android 10 (API 29) 이상에서만 백그라운드 위치 권한 요청
        if (Platform.Version >= 29) {
          try {
            const bgGranted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
            );
            if (bgGranted === PermissionsAndroid.RESULTS.GRANTED) {
              console.log('[GeofenceService] 백그라운드 위치 권한이 허용되었습니다.');
              return true;
            } else {
              console.log('[GeofenceService] 백그라운드 위치 권한이 거부되었습니다.');
              // 백그라운드 권한이 없어도 포그라운드 권한은 있으므로 true 반환
              return true;
            }
          } catch (bgErr) {
            console.warn('[GeofenceService] 백그라운드 위치 권한 요청 오류:', bgErr);
            // 에러가 나도 포그라운드 권한은 있으므로 true 반환
            return true;
          }
        }
      }

      return true;
    } catch (err) {
      console.warn('[GeofenceService] 위치 권한 요청 오류:', err);
      return false;
    }
  }

  /**
   * 사용자의 기프티콘 목록 가져오기
   */
  async loadUserCoupons(): Promise<void> {
    try {
      const response = await getMyGifticons({ page: 0, size: 100 });
      this.userCoupons = response.content;
      console.log(`사용자 기프티콘 ${this.userCoupons.length}개 로드됨`);
    } catch (error) {
      console.error('기프티콘 목록 로드 실패:', error);
    }
  }

  /**
   * 브랜드 ID 추출 (사용자가 가진 기프티콘의 브랜드)
   */
  private getBrandIds(): number[] {
    // 실제로는 브랜드 ID를 매핑해야 하지만, 여기서는 브랜드 이름으로 필터링
    // 백엔드 API가 브랜드 이름으로도 필터링을 지원한다면 사용 가능
    // 일단 모든 매장을 검색하도록 빈 배열 반환 (백엔드에서 처리)
    return [];
  }

  /**
   * 두 지점 간 거리 계산 (미터)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // 지구 반경 (미터)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * 주변 매장 확인 및 알림 전송
   */
  private async checkNearbyStores(lat: number, lon: number): Promise<void> {
    // 마지막 체크 위치와 비교하여 너무 가까우면 스킵
    if (this.notificationState.lastCheckLocation) {
      const distance = this.calculateDistance(
        this.notificationState.lastCheckLocation.lat,
        this.notificationState.lastCheckLocation.lon,
        lat,
        lon
      );
      
      // 500m 이내 이동이면 스킵 (배터리 절약)
      if (distance < 500) {
        return;
      }
    }

    try {
      const request: GeofenceRequestDto = {
        lat,
        lon,
        radius: 2000, // 2km 반경
        brandIds: this.getBrandIds(),
      };

      const response = await getNearbyStores(request);
      await this.processNearbyStores(response, lat, lon);
      
      this.notificationState.lastCheckLocation = { lat, lon };
      this.notificationState.lastCheckTime = Date.now();
    } catch (error) {
      console.error('주변 매장 확인 실패:', error);
    }
  }

  /**
   * 주변 매장 처리 및 알림 전송
   */
  private async processNearbyStores(
    response: GeofenceResponseDto,
    userLat: number,
    userLon: number
  ): Promise<void> {
    if (!response.points || response.points.length === 0) {
      return;
    }

    // 사용자가 가진 기프티콘의 브랜드와 매칭되는 매장 찾기
    const relevantStores = this.findRelevantStores(response.points);

    for (const store of relevantStores) {
      const storeId = store.id;
      
      // 이미 알림을 보낸 매장이면 스킵
      if (this.notificationState.notifiedStores.has(storeId)) {
        continue;
      }

      // 사용자와 매장 간 거리 계산
      const distance = this.calculateDistance(
        userLat,
        userLon,
        store.lat,
        store.lon
      );

      // 매장 반경 내에 있으면 알림 전송
      if (distance <= store.triggerRadius) {
        await this.sendNotification(store, distance);
        this.notificationState.notifiedStores.add(storeId);
      }
    }
  }

  /**
   * 사용자가 가진 기프티콘과 관련된 매장 찾기
   */
  private findRelevantStores(points: MapPoint[]): MapPoint[] {
    if (this.userCoupons.length === 0) {
      return [];
    }

    // 브랜드 이름으로 매칭 (GifticonListResponseDto에 brandId가 없으므로 이름으로 매칭)
    const userBrandNames = new Set(
      this.userCoupons
        .map(coupon => coupon.brandName?.toLowerCase())
        .filter((name): name is string => !!name)
    );

    return points.filter(point => {
      if (!point.includedStores || point.includedStores.length === 0) {
        return false;
      }

      // 브랜드 ID로 매칭 시도 (서버에서 brandId를 제공하는 경우)
      const userBrandIds = new Set(
        this.userCoupons
          .map(coupon => (coupon as any).brandId)
          .filter((id): id is number => id !== undefined && id !== null)
      );

      if (userBrandIds.size > 0) {
        const hasMatchingBrandId = point.includedStores.some(store => 
          store.brandId && userBrandIds.has(store.brandId)
        );
        if (hasMatchingBrandId) {
          return true;
        }
      }

      // 브랜드 이름으로 매칭 (fallback)
      const hasMatchingBrandName = point.includedStores.some(store => 
        store.name && userBrandNames.has(store.name.toLowerCase())
      );

      return hasMatchingBrandName;
    });
  }

  /**
   * 알림 전송 (React Native)
   */
  private async sendNotification(store: MapPoint, distance: number): Promise<void> {
    const hasPermission = await this.requestNotificationPermission();
    if (!hasPermission) {
      console.log('알림 권한이 없습니다.');
      return;
    }

    // 사용 가능한 기프티콘 찾기
    const availableCoupons = this.userCoupons.filter(coupon => 
      coupon.status === 'NOT_USED' && 
      !this.isExpired(coupon.expiryDate)
    );

    if (availableCoupons.length === 0) {
      return;
    }

    const brandName = store.includedStores?.[0]?.name || store.name;
    const distanceText = distance < 1000 
      ? `${Math.round(distance)}m` 
      : `${(distance / 1000).toFixed(1)}km`;

    // Android 채널 생성
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: 'geofence',
        name: 'Geofence 알림',
        importance: AndroidImportance.HIGH,
        sound: 'default',
      });
    }

    // 알림 표시
    await notifee.displayNotification({
      title: '근처에 사용 가능한 기프티콘이 있어요! 🎁',
      body: `${brandName} 매장이 ${distanceText} 거리에 있습니다.`,
      android: {
        channelId: 'geofence',
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
        // smallIcon을 지정하지 않으면 기본 아이콘 사용
        // 또는 ic_launcher를 사용하려면: smallIcon: 'ic_launcher',
      },
      ios: {
        sound: 'default',
      },
      data: {
        storeId: store.id,
        lat: store.lat.toString(),
        lon: store.lon.toString(),
      },
    });
  }

  /**
   * 기프티콘 만료 여부 확인
   */
  private isExpired(expiryDate: string): boolean {
    const expiry = new Date(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return expiry < today;
  }

  /**
   * 현재 위치 가져오기
   */
  private getCurrentPosition(): Promise<{ lat: number; lon: number }> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error(`위치 정보를 가져올 수 없습니다: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  /**
   * 앱 상태 변경 처리
   */
  private handleAppStateChange = (nextAppState: AppStateStatus): void => {
    if (nextAppState === 'active' && this.isEnabled) {
      // 앱이 포그라운드로 돌아오면 즉시 체크
      this.getCurrentPosition()
        .then((position) => {
          this.checkNearbyStores(position.lat, position.lon);
        })
        .catch((error) => {
          console.error('위치 확인 실패:', error);
        });
    }
  };

  /**
   * 백그라운드 감시 시작
   */
  async start(): Promise<void> {
    if (this.isEnabled) {
      console.log('이미 백그라운드 감시가 실행 중입니다.');
      return;
    }

    const hasNotificationPermission = await this.requestNotificationPermission();
    if (!hasNotificationPermission) {
      throw new Error('알림 권한이 필요합니다.');
    }

    const hasLocationPermission = await this.requestLocationPermission();
    if (!hasLocationPermission) {
      throw new Error('위치 권한이 필요합니다.');
    }

    // 사용자 기프티콘 로드
    await this.loadUserCoupons();

    // 위치 감시 시작
    this.watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        this.checkNearbyStores(latitude, longitude);
      },
      (error) => {
        console.error('위치 감시 오류:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000, // 30초 캐시
        distanceFilter: 100, // 100m 이동 시에만 업데이트 (배터리 절약)
      }
    );

    // 주기적 체크 (백그라운드에서도 동작하도록)
    // React Native의 watchPosition은 백그라운드에서도 동작하지만,
    // 추가로 주기적 체크를 수행하여 더 정확한 감지
    this.checkInterval = setInterval(async () => {
      try {
        const position = await this.getCurrentPosition();
        await this.checkNearbyStores(position.lat, position.lon);
      } catch (error) {
        // 백그라운드에서는 위치 권한이 제한될 수 있으므로 에러는 무시
        if (AppState.currentState === 'active') {
          console.error('주기적 위치 체크 실패:', error);
        }
      }
    }, this.checkIntervalMs);

    // 앱 상태 변경 감지
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);

    this.isEnabled = true;
    console.log('백그라운드 Geofence 알림 서비스 시작됨');
  }

  /**
   * 백그라운드 감시 중지
   */
  stop(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.checkInterval !== null) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    this.isEnabled = false;
    this.notificationState.notifiedStores.clear();
    console.log('백그라운드 Geofence 알림 서비스 중지됨');
  }

  /**
   * 알림 상태 초기화 (새로운 위치로 이동했을 때)
   */
  resetNotifications(): void {
    this.notificationState.notifiedStores.clear();
    this.notificationState.lastCheckLocation = null;
  }

  /**
   * 서비스 상태 확인
   */
  getStatus(): { enabled: boolean; hasPermission: boolean; couponCount: number } {
    return {
      enabled: this.isEnabled,
      hasPermission: true, // React Native에서는 권한 체크가 다름
      couponCount: this.userCoupons.length,
    };
  }
}

// 싱글톤 인스턴스
export const geofenceNotificationService = new GeofenceNotificationService();
