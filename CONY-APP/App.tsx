/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, ActivityIndicator, View, Platform, PermissionsAndroid, Alert } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import MainPage from './src/page/manage/main/MainPage';
import CouponList from './src/page/manage/couponBox/CouponList';
import Mypage from './src/page/mypage/Mypage';
import PaymentMain from './src/page/payment/main/Main';
import CouponCreate from './src/page/manage/crud/CouponCreate';
import CouponDetail from './src/page/manage/crud/CouponDetail';
import CouponModify from './src/page/manage/crud/CouponModify';
import PaymentDetail from './src/page/payment/detail/Detail';
import LoginPage from './src/page/auth/LoginPage';
import OAuthCallback from './src/page/auth/OAuthCallback';
import OAuthWebView from './src/page/auth/OAuthWebView';
import AlertPage from './src/page/mypage/AlertPage';
import MySalesPage from './src/page/sale/MySalesPage';
import { COLORS } from './src/constants/colors';
import { initializeFCM, setupFCMTokenRefresh } from './src/services/fcmService';

const Stack = createStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<string>('LoginPage'); // 기본값 설정

  // 위치 권한 요청 (Android)
  const requestLocationPermission = async (): Promise<boolean> => {
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
              console.log('[App] 백그라운드 위치 권한이 허용되었습니다.');
              return true;
            } else {
              console.log('[App] 백그라운드 위치 권한이 거부되었습니다.');
              // 백그라운드 권한이 없어도 포그라운드 권한은 있으므로 true 반환
              return true;
            }
          } catch (bgErr) {
            console.warn('[App] 백그라운드 위치 권한 요청 오류:', bgErr);
            // 에러가 나도 포그라운드 권한은 있으므로 true 반환
            return true;
          }
        }
      }

      return true;
    } catch (err) {
      console.warn('[App] 위치 권한 요청 오류:', err);
      return false;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        if (accessToken) {
          setInitialRoute('MainPage');
          
          // 로그인된 사용자에게 위치 권한 요청
          // 약간의 지연을 두어 앱이 완전히 로드된 후 권한 요청
          setTimeout(async () => {
            try {
              const hasPermission = await requestLocationPermission();
              if (!hasPermission) {
                console.log('[App] 위치 권한이 거부되었습니다.');
              } else {
                console.log('[App] 위치 권한이 허용되었습니다.');
              }
            } catch (error) {
              console.error('[App] 위치 권한 요청 오류:', error);
            }
          }, 1000);
        } else {
          setInitialRoute('LoginPage');
        }
      } catch (error) {
        console.error('[App] 인증 확인 오류:', error);
        setInitialRoute('LoginPage');
      } finally {
        setIsLoading(false);
      }
    };

    // FCM 초기화
    const initFCM = async () => {
      try {
        // FCM 토큰 새로고침 리스너 설정
        setupFCMTokenRefresh();
        
        // FCM 초기화 및 토큰 받기
        setTimeout(async () => {
          await initializeFCM();
        }, 2000); // 앱이 완전히 로드된 후 초기화
      } catch (error) {
        console.error('[App] FCM 초기화 오류:', error);
      }
    };

    checkAuth();
    initFCM();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
          }}
        >
          {/* 웹과 동일한 라우팅 구조 */}
          <Stack.Screen name="MainPage" component={MainPage} />
          <Stack.Screen name="CouponList" component={CouponList} />
          <Stack.Screen name="Mypage" component={Mypage} />
          <Stack.Screen name="PaymentMain" component={PaymentMain} />
          <Stack.Screen name="CouponCreate" component={CouponCreate} />
          <Stack.Screen name="CouponDetail" component={CouponDetail} />
          <Stack.Screen name="CouponModify" component={CouponModify} />
          <Stack.Screen name="PaymentDetail" component={PaymentDetail} />
          <Stack.Screen name="LoginPage" component={LoginPage} />
          <Stack.Screen name="OAuthCallback" component={OAuthCallback} />
          <Stack.Screen name="OAuthWebView" component={OAuthWebView} />
          <Stack.Screen name="AlertPage" component={AlertPage} />
          <Stack.Screen name="MySalesPage" component={MySalesPage} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
});

export default App;
