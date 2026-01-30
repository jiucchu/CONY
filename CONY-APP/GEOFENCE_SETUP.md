# Geofence 알림 기능 설정 가이드

React Native 앱에서 Geofence 백그라운드 알림 기능을 사용하기 위한 설정 가이드입니다.

## 필요한 라이브러리 설치

```bash
npm install @react-native-async-storage/async-storage
npm install @react-native-community/geolocation
npm install @notifee/react-native

# iOS의 경우 추가 설치 필요
cd ios && pod install && cd ..
```

## Android 설정

### 1. AndroidManifest.xml에 권한 추가

`android/app/src/main/AndroidManifest.xml` 파일에 다음 권한을 추가하세요:

```xml
<manifest>
  <!-- 위치 권한 -->
  <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
  <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
  <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
  
  <!-- 알림 권한 (Android 13+) -->
  <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
  
  <!-- 백그라운드 작업 -->
  <uses-permission android:name="android.permission.WAKE_LOCK" />
  <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
  
  <application>
    <!-- ... 기존 설정 ... -->
  </application>
</manifest>
```

### 2. ProGuard 설정 (릴리즈 빌드 시)

`android/app/proguard-rules.pro` 파일에 다음을 추가:

```
-keep class com.dieam.reactnativepushnotification.** { *; }
-keep class com.notifee.** { *; }
```

## iOS 설정

### 1. Info.plist에 권한 설명 추가

`ios/ConyApp/Info.plist` 파일에 다음을 추가:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>근처 매장 알림을 위해 위치 정보가 필요합니다.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>백그라운드에서도 근처 매장 알림을 받기 위해 위치 정보가 필요합니다.</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>백그라운드에서도 근처 매장 알림을 받기 위해 위치 정보가 필요합니다.</string>
```

### 2. Background Modes 활성화

Xcode에서 프로젝트 설정 > Capabilities > Background Modes에서 다음을 활성화:
- Location updates
- Background fetch
- Remote notifications

## 사용 방법

```tsx
import { useGeofenceNotification } from '@/hooks/useGeofenceNotification';

function MyComponent() {
  const { 
    isEnabled, 
    hasPermission, 
    start, 
    stop, 
    requestPermission,
    loading,
    error 
  } = useGeofenceNotification();

  return (
    <View>
      {!hasPermission && (
        <Button title="알림 권한 허용" onPress={requestPermission} />
      )}
      
      {hasPermission && !isEnabled && (
        <Button title="백그라운드 알림 시작" onPress={start} disabled={loading} />
      )}
      
      {isEnabled && (
        <Button title="백그라운드 알림 중지" onPress={stop} />
      )}
      
      {error && <Text>오류: {error}</Text>}
    </View>
  );
}
```

## 주의사항

1. **백그라운드 위치 추적**: 현재 구현은 앱이 포그라운드에 있을 때만 동작합니다. 완전한 백그라운드 위치 추적을 위해서는 `react-native-background-geolocation` (유료) 또는 서버 기반 Push Notification을 사용해야 합니다.

2. **배터리 최적화**: 
   - `distanceFilter` 옵션으로 불필요한 위치 업데이트 방지
   - 주기적 체크 간격 조정 (`checkIntervalMs`)

3. **권한 처리**: 
   - 사용자가 권한을 거부한 경우, 앱 설정으로 이동하도록 안내 필요
   - iOS는 항상 사용 권한이 필요하며, Android 10+는 백그라운드 위치 권한이 별도로 필요합니다.

## 추가 개선 사항

완전한 백그라운드 동작을 위해서는:

1. **서버 기반 Push Notification** (권장)
   - 백엔드에서 사용자 위치를 주기적으로 확인
   - 근처 매장 발견 시 Push Notification 전송

2. **react-native-background-geolocation** (유료)
   - 완전한 백그라운드 위치 추적
   - Geofence 기능 내장
