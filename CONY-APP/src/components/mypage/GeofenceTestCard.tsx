import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useGeofenceNotification } from '@/hooks/useGeofenceNotification';
import { geofenceNotificationService } from '@/services/geofenceNotificationService';
import { StyledText } from '@/utils/StyledText';
import { COLORS } from '@/constants/colors';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

const GeofenceTestCard = () => {
  const {
    isEnabled,
    hasPermission,
    error,
    loading,
    start,
    stop,
    requestPermission,
  } = useGeofenceNotification();

  const [testLocation, setTestLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [testingLocation, setTestingLocation] = useState(false);

  // 테스트용 알림 전송 (실제 위치 없이)
  const sendTestNotification = async () => {
    try {
      const hasPerm = await requestPermission();
      if (!hasPerm) {
        Alert.alert('알림 권한 필요', '알림 권한이 필요합니다. 설정에서 권한을 허용해주세요.');
        return;
      }

      // Android 채널 생성
      if (Platform.OS === 'android') {
        await notifee.createChannel({
          id: 'geofence',
          name: 'Geofence 알림',
          importance: AndroidImportance.HIGH,
          sound: 'default',
        });
      }

      // 테스트 알림 표시
      await notifee.displayNotification({
        title: '테스트 알림 🎁',
        body: '지오펜스 알림이 정상적으로 작동합니다!',
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
      });

      Alert.alert('성공', '테스트 알림이 전송되었습니다.');
    } catch (err: any) {
      Alert.alert('오류', err.message || '알림 전송에 실패했습니다.');
    }
  };

  // 현재 위치로 테스트
  const testWithCurrentLocation = async () => {
    if (testingLocation) {
      return; // 이미 테스트 중이면 무시
    }

    setTestingLocation(true);
    
    try {
      // 위치 권한 확인 및 요청
      const hasLocationPermission = await geofenceNotificationService.requestLocationPermission();
      if (!hasLocationPermission) {
        Alert.alert(
          '위치 권한 필요',
          '위치 테스트를 위해 위치 권한이 필요합니다. 앱 설정에서 위치 권한을 허용해주세요.',
          [{ text: '확인' }]
        );
        setTestingLocation(false);
        return;
      }

      // 현재 위치 가져오기
      const getCurrentPosition = (): Promise<{ lat: number; lon: number }> => {
        return new Promise((resolve, reject) => {
          Geolocation.getCurrentPosition(
            (position) => {
              resolve({
                lat: position.coords.latitude,
                lon: position.coords.longitude,
              });
            },
            (error) => {
              let errorMessage = '위치 정보를 가져올 수 없습니다.';
              if (error.code === 1) {
                errorMessage = '위치 권한이 거부되었습니다.';
              } else if (error.code === 2) {
                errorMessage = '위치 정보를 사용할 수 없습니다.';
              } else if (error.code === 3) {
                errorMessage = '위치 정보 요청 시간이 초과되었습니다.';
              }
              reject(new Error(errorMessage));
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 60000,
            }
          );
        });
      };

      console.log('[GeofenceTestCard] 현재 위치 가져오는 중...');
      
      // 여러 번 위치를 가져와서 일관성 확인
      const locations: { lat: number; lon: number }[] = [];
      for (let i = 0; i < 3; i++) {
        try {
          const loc = await getCurrentPosition();
          locations.push(loc);
          console.log(`[GeofenceTestCard] 위치 ${i + 1}:`, loc);
          // 각 위치 사이에 짧은 대기
          if (i < 2) {
            await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
          }
        } catch (err) {
          console.error(`[GeofenceTestCard] 위치 ${i + 1} 획득 실패:`, err);
        }
      }
      
      if (locations.length === 0) {
        Alert.alert('오류', '위치 정보를 가져올 수 없습니다.');
        setTestingLocation(false);
        return;
      }
      
      // 평균 위치 계산
      const avgLocation = {
        lat: locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length,
        lon: locations.reduce((sum, loc) => sum + loc.lon, 0) / locations.length,
      };
      
      // 위치 일관성 확인 (각 위치가 평균에서 0.01도 이내인지 확인)
      const isConsistent = locations.every(loc => 
        Math.abs(loc.lat - avgLocation.lat) < 0.01 && 
        Math.abs(loc.lon - avgLocation.lon) < 0.01
      );
      
      const location = avgLocation;
      console.log('[GeofenceTestCard] 평균 위치:', location);
      console.log('[GeofenceTestCard] 위치 일관성:', isConsistent ? '일관됨' : '불일치');
      
      // 위치 정보 표시
      let locationInfo = `위치 획득: ${locations.length}회\n`;
      locations.forEach((loc, idx) => {
        locationInfo += `${idx + 1}. 위도: ${loc.lat.toFixed(6)}, 경도: ${loc.lon.toFixed(6)}\n`;
      });
      locationInfo += `\n평균 위치:\n위도: ${location.lat.toFixed(6)}\n경도: ${location.lon.toFixed(6)}`;
      
      if (!isConsistent) {
        locationInfo += `\n\n⚠️ 위치가 일관되지 않습니다. GPS 신호를 확인해주세요.`;
      }
      
      // GPS 검증 제거 (에뮬레이터에서 GPS가 이상하게 동작할 수 있음)
      
      // 위치가 유효하면 정보 표시 후 계속 진행
      if (!isConsistent) {
        Alert.alert('위치 확인', `${locationInfo}\n\n위치가 약간 불일치하지만 계속 진행합니다.`);
      }
      
      setTestLocation(location);
      
      // 지오펜스 API 호출
      const { getNearbyStores } = await import('@/api/geofence/geofenceApi');
      
      console.log('[GeofenceTestCard] 주변 매장 검색 중...');
      const response = await getNearbyStores({
        lat: location.lat,
        lon: location.lon,
        radius: 2000, // 2km 반경
      });

      console.log('[GeofenceTestCard] 검색 결과:', response);

      if (response.points && response.points.length > 0) {
        const storeCount = response.points.filter(p => p.type === 'STORE').length;
        const clusterCount = response.points.filter(p => p.type === 'CLUSTER').length;
        
        Alert.alert(
          '검색 완료',
          `위도: ${location.lat.toFixed(6)}\n경도: ${location.lon.toFixed(6)}\n\n주변에 ${response.points.length}개의 매장/클러스터를 찾았습니다.\n- 매장: ${storeCount}개\n- 클러스터: ${clusterCount}개\n\n백그라운드 알림이 활성화되어 있으면 매장 근처 접근 시 알림을 받을 수 있습니다.`
        );
      } else {
        Alert.alert(
          '검색 결과',
          `위도: ${location.lat.toFixed(6)}\n경도: ${location.lon.toFixed(6)}\n\n주변에 매장이 없습니다.`
        );
      }
    } catch (err: any) {
      console.error('[GeofenceTestCard] 위치 테스트 오류:', err);
      Alert.alert('오류', err.message || '위치 테스트에 실패했습니다.');
    } finally {
      setTestingLocation(false);
    }
  };

  // 알림 상태 초기화 (중복 알림 방지 해제)
  const resetNotifications = () => {
    geofenceNotificationService.resetNotifications();
    Alert.alert('완료', '알림 상태가 초기화되었습니다. 같은 매장에 대해 다시 알림을 받을 수 있습니다.');
  };

  return (
    <View style={styles.container}>
      <StyledText fontSize={18} fontWeight={700} color={COLORS.text.primary} style={styles.title}>
        지오펜스 알림 테스트
      </StyledText>

      <View style={styles.statusContainer}>
        <View style={styles.statusRow}>
          <StyledText fontSize={14} fontWeight={500} color={COLORS.text.secondary}>
            알림 권한:
          </StyledText>
          <StyledText
            fontSize={14}
            fontWeight={600}
            color={hasPermission ? COLORS.success : COLORS.error}
          >
            {hasPermission ? '허용됨' : '거부됨'}
          </StyledText>
        </View>

        <View style={styles.statusRow}>
          <StyledText fontSize={14} fontWeight={500} color={COLORS.text.secondary}>
            서비스 상태:
          </StyledText>
          <StyledText
            fontSize={14}
            fontWeight={600}
            color={isEnabled ? COLORS.success : COLORS.text.secondary}
          >
            {isEnabled ? '실행 중' : '중지됨'}
          </StyledText>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <StyledText fontSize={12} fontWeight={400} color={COLORS.error}>
            {error}
          </StyledText>
        </View>
      )}

      <View style={styles.buttonContainer}>
        {!hasPermission && (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={requestPermission}
            disabled={loading}
          >
            <StyledText fontSize={14} fontWeight={600} color={COLORS.white}>
              알림 권한 요청
            </StyledText>
          </TouchableOpacity>
        )}

        {!isEnabled ? (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={start}
            disabled={loading || !hasPermission}
          >
            <StyledText fontSize={14} fontWeight={600} color={COLORS.white}>
              {loading ? '시작 중...' : '백그라운드 알림 시작'}
            </StyledText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={stop}
            disabled={loading}
          >
            <StyledText fontSize={14} fontWeight={600} color={COLORS.white}>
              백그라운드 알림 중지
            </StyledText>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.testButton]}
          onPress={sendTestNotification}
          disabled={loading}
        >
          <StyledText fontSize={14} fontWeight={600} color={COLORS.primary}>
            테스트 알림 전송
          </StyledText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, (testingLocation || loading) && styles.disabledButton]}
          onPress={testWithCurrentLocation}
          disabled={testingLocation || loading}
        >
          <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
            {testingLocation ? '위치 확인 중...' : '현재 위치로 테스트'}
          </StyledText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={resetNotifications}
          disabled={loading}
        >
          <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
            알림 상태 초기화
          </StyledText>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <StyledText fontSize={12} fontWeight={400} color={COLORS.text.secondary} style={styles.infoText}>
          • 테스트 알림: 알림 기능이 정상 작동하는지 확인합니다.
        </StyledText>
        <StyledText fontSize={12} fontWeight={400} color={COLORS.text.secondary} style={styles.infoText}>
          • 백그라운드 알림: 실제 위치 기반으로 매장 근처 접근 시 알림을 받습니다.
        </StyledText>
        <StyledText fontSize={12} fontWeight={400} color={COLORS.text.secondary} style={styles.infoText}>
          • 알림 상태 초기화: 같은 매장에 대해 다시 알림을 받을 수 있도록 합니다.
        </StyledText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    marginBottom: 16,
  },
  statusContainer: {
    backgroundColor: COLORS.background.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  errorContainer: {
    backgroundColor: COLORS.error + '20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  dangerButton: {
    backgroundColor: COLORS.error,
  },
  testButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.background.lightGray,
  },
  disabledButton: {
    opacity: 0.5,
  },
  infoContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.background.lightGray,
  },
  infoText: {
    marginBottom: 8,
    lineHeight: 18,
  },
});

export default GeofenceTestCard;
