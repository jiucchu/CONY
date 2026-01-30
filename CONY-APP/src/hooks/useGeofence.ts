import { useState, useEffect, useRef, useCallback } from 'react';
import Geolocation from '@react-native-community/geolocation';
import { getNearbyStores } from '@/api/geofence/geofenceApi';
import type { GeofenceRequestDto, GeofenceResponseDto } from '@/types/geofence/geofence';

interface UseGeofenceOptions {
  autoWatch?: boolean; // 자동으로 위치 감시할지 여부
  refreshRadius?: number; // 재요청 기준 거리 (미터, 기본값: 2000)
  brandIds?: number[]; // 브랜드 ID 필터
}

interface UserLocation {
  lat: number;
  lon: number;
}

/**
 * Geofence API를 사용하기 위한 커스텀 훅 (React Native)
 * 
 * 사용 예시:
 * ```tsx
 * const { nearbyStores, loading, error, refreshStores, currentLocation } = useGeofence({
 *   autoWatch: true,
 *   brandIds: [1, 2, 3]
 * });
 * ```
 */
export const useGeofence = (options: UseGeofenceOptions = {}) => {
  const { autoWatch = false, refreshRadius = 2000, brandIds } = options;
  
  const [nearbyStores, setNearbyStores] = useState<GeofenceResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<UserLocation | null>(null);
  
  const lastRequestLocation = useRef<UserLocation | null>(null);
  const watchIdRef = useRef<number | null>(null);

  /**
   * 두 지점 간 거리 계산 (Haversine 공식)
   */
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // 지구 반경 (미터)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  /**
   * 주변 매장 검색
   */
  const fetchNearbyStores = useCallback(async (lat: number, lon: number) => {
    // 마지막 요청 위치와 비교하여 refreshRadius 이내면 요청하지 않음
    if (lastRequestLocation.current) {
      const distance = calculateDistance(
        lastRequestLocation.current.lat,
        lastRequestLocation.current.lon,
        lat,
        lon
      );
      
      if (distance < refreshRadius) {
        console.log(`위치 변경이 ${refreshRadius}m 미만이므로 요청을 건너뜁니다. (${Math.round(distance)}m)`);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const request: GeofenceRequestDto = {
        lat,
        lon,
        radius: refreshRadius * 1.5, // 검색 반경은 refreshRadius보다 조금 더 크게
        brandIds,
      };

      const response = await getNearbyStores(request);
      setNearbyStores(response);
      lastRequestLocation.current = { lat, lon };
      setCurrentLocation({ lat, lon });
    } catch (err: any) {
      setError(err.message || '주변 매장 검색에 실패했습니다.');
      console.error('주변 매장 검색 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [refreshRadius, brandIds]);

  /**
   * 현재 위치 가져오기
   */
  const getCurrentPosition = useCallback((): Promise<UserLocation> => {
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
          maximumAge: 60000, // 1분 이내 캐시된 위치 사용 가능
        }
      );
    });
  }, []);

  /**
   * 수동으로 주변 매장 새로고침
   */
  const refreshStores = useCallback(async (lat?: number, lon?: number) => {
    try {
      if (lat !== undefined && lon !== undefined) {
        await fetchNearbyStores(lat, lon);
      } else {
        const location = await getCurrentPosition();
        await fetchNearbyStores(location.lat, location.lon);
      }
    } catch (err: any) {
      setError(err.message || '위치 정보를 가져올 수 없습니다.');
    }
  }, [fetchNearbyStores, getCurrentPosition]);

  /**
   * 위치 감시 시작
   */
  useEffect(() => {
    if (!autoWatch) return;

    // 초기 위치 가져오기
    getCurrentPosition()
      .then((location) => {
        fetchNearbyStores(location.lat, location.lon);
      })
      .catch((err) => {
        setError(err.message);
      });

    // 위치 변경 감시 시작
    watchIdRef.current = Geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        fetchNearbyStores(newLocation.lat, newLocation.lon);
      },
      (error) => {
        setError(`위치 감시 실패: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000, // 30초 이내 캐시된 위치 사용
        distanceFilter: 100, // 100m 이동 시에만 업데이트 (배터리 절약)
      }
    );

    // cleanup: 위치 감시 중지
    return () => {
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [autoWatch, fetchNearbyStores, getCurrentPosition]);

  return {
    nearbyStores,
    loading,
    error,
    currentLocation,
    refreshStores,
    getCurrentPosition,
  };
};
