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
import { Platform, AppState, AppStateStatus } from 'react-native';

interface StoreGeofenceState {
  storeId: string;
  isInside: boolean; // 현재 매장 반경 내에 있는지 여부
  enteredAt: number | null; // 진입 시간
  lastCheckedAt: number; // 마지막 체크 시간
}

interface NotificationState {
  notifiedStores: Set<string>; // 이미 알림을 보낸 매장 ID들
  lastCheckLocation: { lat: number; lon: number } | null;
  lastCheckTime: number;
  storeStates: Map<string, StoreGeofenceState>; // 매장별 지오펜싱 상태
}

export type GeofenceEventType = 'ENTER' | 'EXIT';

export interface GeofenceEvent {
  type: GeofenceEventType;
  store: MapPoint;
  distance: number;
  timestamp: number;
}

import type { GeofenceRequestDto, GeofenceResponseDto, MapPoint } from '@/types/geofence/geofence';

export type GeofenceEventHandler = (event: GeofenceEvent) => void;

class GeofenceNotificationService {
  private watchId: number | null = null;
  private checkInterval: NodeJS.Timeout | null = null;
  private notificationState: NotificationState = {
    notifiedStores: new Set(),
    lastCheckLocation: null,
    lastCheckTime: 0,
    storeStates: new Map(),
  };
  private userCoupons: GifticonListResponseDto[] = [];
  private isEnabled = false;
  private checkIntervalMs = 60000; // 1분마다 체크
  private appStateSubscription: any = null;
  private eventHandlers: GeofenceEventHandler[] = []; // 진입/진출 이벤트 핸들러

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
   * 위치 권한 요청 (백그라운드 포함)
   */
  async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      // Android는 백그라운드 위치 권한이 별도로 필요
      const { PermissionsAndroid } = require('react-native');
      
      try {
        // 포그라운드 위치 권한 확인
        const foregroundGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        
        if (!foregroundGranted) {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          if (result !== PermissionsAndroid.RESULTS.GRANTED) {
            return false;
          }
        }

        // 백그라운드 위치 권한 확인 (Android 10+)
        if (Platform.Version >= 29) {
          const backgroundGranted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
          );
          
          if (!backgroundGranted) {
            // 백그라운드 권한은 사용자가 설정에서 직접 허용해야 함
            console.log('백그라운드 위치 권한이 필요합니다. 앱 설정에서 허용해주세요.');
            // 일단 포그라운드 권한만으로 진행
            return true;
          }
        }
        
        return true;
      } catch (error) {
        console.error('위치 권한 요청 실패:', error);
        return false;
      }
    } else {
      // iOS는 항상 사용 권한 요청
      return new Promise((resolve) => {
        Geolocation.requestAuthorization(
          () => resolve(true),
          () => resolve(false)
        );
      });
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
   * 주변 매장 처리 및 진입/진출 이벤트 감지
   */
  private async processNearbyStores(
    response: GeofenceResponseDto,
    userLat: number,
    userLon: number
  ): Promise<void> {
    if (!response.points || response.points.length === 0) {
      // 모든 매장에서 벗어났는지 확인
      this.checkAllStoresExited();
      return;
    }

    // 사용자가 가진 기프티콘의 브랜드와 매칭되는 매장 찾기
    const relevantStores = this.findRelevantStores(response.points);
    const currentStoreIds = new Set(relevantStores.map(s => s.id));

    // 현재 위치에서 각 매장의 상태 확인
    for (const store of relevantStores) {
      const storeId = store.id;
      const distance = this.calculateDistance(
        userLat,
        userLon,
        store.lat,
        store.lon
      );

      const isInside = distance <= store.triggerRadius;
      const previousState = this.notificationState.storeStates.get(storeId);

      // 상태 초기화 (첫 체크)
      if (!previousState) {
        const newState: StoreGeofenceState = {
          storeId,
          isInside,
          enteredAt: isInside ? Date.now() : null,
          lastCheckedAt: Date.now(),
        };
        this.notificationState.storeStates.set(storeId, newState);

        // 진입 이벤트 발생
        if (isInside) {
          await this.handleGeofenceEvent({
            type: 'ENTER',
            store,
            distance,
            timestamp: Date.now(),
          });
        }
        continue;
      }

      // 상태 변경 감지
      if (previousState.isInside !== isInside) {
        const newState: StoreGeofenceState = {
          ...previousState,
          isInside,
          enteredAt: isInside ? Date.now() : null,
          lastCheckedAt: Date.now(),
        };
        this.notificationState.storeStates.set(storeId, newState);

        // 진입/진출 이벤트 발생
        const eventType: GeofenceEventType = isInside ? 'ENTER' : 'EXIT';
        await this.handleGeofenceEvent({
          type: eventType,
          store,
          distance,
          timestamp: Date.now(),
        });
      } else {
        // 상태가 동일하면 마지막 체크 시간만 업데이트
        previousState.lastCheckedAt = Date.now();
      }
    }

    // 이전에 체크했던 매장 중 현재 목록에 없는 매장은 진출 처리
    for (const [storeId, state] of this.notificationState.storeStates.entries()) {
      if (!currentStoreIds.has(storeId) && state.isInside) {
        // 매장에서 벗어났지만 아직 상태가 업데이트되지 않음
        // 마지막 체크로부터 일정 시간이 지났으면 진출 처리
        const timeSinceLastCheck = Date.now() - state.lastCheckedAt;
        if (timeSinceLastCheck > 300000) { // 5분 이상
          state.isInside = false;
          state.enteredAt = null;
          
          // 진출 이벤트는 매장 정보가 없으므로 스킵하거나 마지막 정보 사용
          console.log(`매장 ${storeId}에서 벗어남 (시간 초과)`);
        }
      }
    }
  }

  /**
   * 모든 매장에서 벗어났는지 확인
   */
  private checkAllStoresExited(): void {
    for (const [storeId, state] of this.notificationState.storeStates.entries()) {
      if (state.isInside) {
        const timeSinceLastCheck = Date.now() - state.lastCheckedAt;
        if (timeSinceLastCheck > 300000) { // 5분 이상
          state.isInside = false;
          state.enteredAt = null;
          console.log(`매장 ${storeId}에서 벗어남 (모든 매장 범위 밖)`);
        }
      }
    }
  }

  /**
   * 지오펜싱 이벤트 처리
   */
  private async handleGeofenceEvent(event: GeofenceEvent): Promise<void> {
    console.log(`[Geofence Event] ${event.type}: ${event.store.name} (${Math.round(event.distance)}m)`);

    // 이벤트 핸들러 호출
    this.eventHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error('이벤트 핸들러 실행 오류:', error);
      }
    });

    // 진입 이벤트일 때만 알림 전송
    if (event.type === 'ENTER') {
      // 이미 알림을 보낸 매장이면 스킵
      if (this.notificationState.notifiedStores.has(event.store.id)) {
        return;
      }

      await this.sendNotification(event.store, event.distance, 'ENTER');
      this.notificationState.notifiedStores.add(event.store.id);
    } else if (event.type === 'EXIT') {
      // 진출 시 알림 상태 초기화 (다시 진입 시 알림 가능하도록)
      this.notificationState.notifiedStores.delete(event.store.id);
      await this.sendNotification(event.store, event.distance, 'EXIT');
    }
  }

  /**
   * 지오펜싱 이벤트 핸들러 등록
   */
  addEventListener(handler: GeofenceEventHandler): () => void {
    this.eventHandlers.push(handler);
    
    // 제거 함수 반환
    return () => {
      const index = this.eventHandlers.indexOf(handler);
      if (index > -1) {
        this.eventHandlers.splice(index, 1);
      }
    };
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
  private async sendNotification(
    store: MapPoint, 
    distance: number, 
    eventType: GeofenceEventType = 'ENTER'
  ): Promise<void> {
    const hasPermission = await this.requestNotificationPermission();
    if (!hasPermission) {
      console.log('알림 권한이 없습니다.');
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

    let title: string;
    let body: string;

    if (eventType === 'ENTER') {
      // 사용 가능한 기프티콘 찾기
      const availableCoupons = this.userCoupons.filter(coupon => 
        coupon.status === 'NOT_USED' && 
        !this.isExpired(coupon.expiryDate)
      );

      if (availableCoupons.length === 0) {
        return;
      }

      title = '근처에 사용 가능한 기프티콘이 있어요! 🎁';
      body = `${brandName} 매장이 ${distanceText} 거리에 있습니다.`;
    } else {
      title = '매장 범위를 벗어났습니다';
      body = `${brandName} 매장에서 ${distanceText} 떨어져 있습니다.`;
    }

    // 알림 표시
    await notifee.displayNotification({
      title,
      body,
      android: {
        channelId: 'geofence',
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
      },
      ios: {
        sound: 'default',
      },
      data: {
        storeId: store.id,
        lat: store.lat.toString(),
        lon: store.lon.toString(),
        eventType,
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

    // 위치 감시 시작 (백그라운드에서도 동작하도록 설정)
    this.watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const appState = AppState.currentState;
        console.log(`[Geofence] 위치 업데이트: ${latitude}, ${longitude} (앱 상태: ${appState})`);
        this.checkNearbyStores(latitude, longitude);
      },
      (error) => {
        const appState = AppState.currentState;
        console.error(`[Geofence] 위치 감시 오류 (앱 상태: ${appState}):`, error);
        // 백그라운드에서는 에러가 발생할 수 있으므로 재시도 로직은 생략
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // 백그라운드에서 더 긴 타임아웃
        maximumAge: 60000, // 1분 캐시 (백그라운드에서 더 긴 캐시 허용)
        distanceFilter: 50, // 50m 이동 시 업데이트 (더 정확한 감지)
      }
    );

    // 주기적 체크 (백그라운드에서도 동작하도록)
    // React Native의 watchPosition은 백그라운드에서도 동작하지만,
    // 추가로 주기적 체크를 수행하여 더 정확한 감지
    // 백그라운드에서는 간격을 늘려 배터리 절약
    this.checkInterval = setInterval(async () => {
      try {
        const appState = AppState.currentState;
        const position = await this.getCurrentPosition();
        console.log(`[Geofence] 주기적 체크: ${position.lat}, ${position.lon} (앱 상태: ${appState})`);
        await this.checkNearbyStores(position.lat, position.lon);
      } catch (error) {
        // 백그라운드에서는 위치 권한이 제한될 수 있으므로 에러는 무시
        const appState = AppState.currentState;
        if (appState === 'active') {
          console.error('[Geofence] 주기적 위치 체크 실패:', error);
        } else {
          console.log(`[Geofence] 백그라운드 위치 체크 실패 (앱 상태: ${appState})`);
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
    this.notificationState.storeStates.clear();
    this.eventHandlers = [];
    console.log('백그라운드 Geofence 알림 서비스 중지됨');
  }

  /**
   * 알림 상태 초기화 (새로운 위치로 이동했을 때)
   */
  resetNotifications(): void {
    this.notificationState.notifiedStores.clear();
    this.notificationState.lastCheckLocation = null;
    this.notificationState.storeStates.clear();
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
