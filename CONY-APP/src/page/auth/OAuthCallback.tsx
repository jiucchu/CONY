import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyledText } from '@/utils/StyledText';
import { COLORS } from '@/constants/colors';
import { API_BASE_URL } from '@/constants/api';
import { registerFcmTokenToBackend } from '@/services/fcmService';

const OAuthCallback = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // URL 파라미터에서 토큰 추출 (웹뷰에서 리다이렉트된 경우)
        const params = (route.params as any) || {};
        const accessToken = params.accessToken || (route.params as any)?.accessToken;
        const refreshToken = params.refreshToken || (route.params as any)?.refreshToken;

        if (accessToken) {
          // 토큰 저장
          await AsyncStorage.setItem('accessToken', accessToken);
          if (refreshToken) {
            await AsyncStorage.setItem('refreshToken', refreshToken);
          }
          
          // 로그인 성공 후 FCM 토큰 등록 시도
          try {
            const fcmToken = await AsyncStorage.getItem('fcmToken');
            if (fcmToken) {
              console.log('[OAuthCallback] 로그인 후 FCM 토큰 등록 시도');
              await registerFcmTokenToBackend(fcmToken);
            }
          } catch (error) {
            console.error('[OAuthCallback] FCM 토큰 등록 오류:', error);
            // FCM 토큰 등록 실패해도 로그인은 계속 진행
          }
          
          setStatus('success');
          // 메인 페이지로 이동
          setTimeout(() => {
            (navigation as any).reset({
              index: 0,
              routes: [{ name: 'MainPage' }],
            });
          }, 1000);
        } else {
          // 토큰이 없으면 서버에서 가져오기 시도
          try {
            const response = await fetch(`${API_BASE_URL}/v1/auth/oauth/callback`, {
              method: 'GET',
              credentials: 'include',
            });

            if (response.ok) {
              const data = await response.json();
              const tokens = data.data || data;
              if (tokens.accessToken) {
                await AsyncStorage.setItem('accessToken', tokens.accessToken);
                if (tokens.refreshToken) {
                  await AsyncStorage.setItem('refreshToken', tokens.refreshToken);
                }
                
                // 로그인 성공 후 FCM 토큰 등록 시도
                try {
                  const fcmToken = await AsyncStorage.getItem('fcmToken');
                  if (fcmToken) {
                    console.log('[OAuthCallback] 로그인 후 FCM 토큰 등록 시도');
                    await registerFcmTokenToBackend(fcmToken);
                  }
                } catch (error) {
                  console.error('[OAuthCallback] FCM 토큰 등록 오류:', error);
                  // FCM 토큰 등록 실패해도 로그인은 계속 진행
                }
                
                setStatus('success');
                setTimeout(() => {
                  (navigation as any).reset({
                    index: 0,
                    routes: [{ name: 'MainPage' }],
                  });
                }, 1000);
              } else {
                throw new Error('토큰을 받을 수 없습니다.');
              }
            } else {
              throw new Error('토큰 요청 실패');
            }
          } catch (error) {
            console.error('OAuth 콜백 처리 오류:', error);
            setStatus('error');
            setTimeout(() => {
              (navigation as any).replace('LoginPage');
            }, 2000);
          }
        }
      } catch (error) {
        console.error('OAuth 콜백 처리 오류:', error);
        setStatus('error');
        setTimeout(() => {
          (navigation as any).replace('LoginPage');
        }, 2000);
      }
    };

    handleOAuthCallback();
  }, [navigation, route]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white }}>
      {status === 'loading' && (
        <>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <StyledText fontSize={16} fontWeight={500} color={COLORS.text.primary} style={{ marginTop: 16 }}>
            로그인 처리 중...
          </StyledText>
        </>
      )}
      {status === 'success' && (
        <>
          <StyledText fontSize={16} fontWeight={500} color={COLORS.primary}>
            로그인 성공!
          </StyledText>
        </>
      )}
      {status === 'error' && (
        <>
          <StyledText fontSize={16} fontWeight={500} color={COLORS.text.secondary}>
            로그인에 실패했습니다.
          </StyledText>
          <StyledText fontSize={14} fontWeight={400} color={COLORS.text.secondary} style={{ marginTop: 8 }}>
            로그인 페이지로 이동합니다...
          </StyledText>
        </>
      )}
    </View>
  );
};

export default OAuthCallback;
