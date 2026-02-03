import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StyledText } from '@/utils/StyledText';
import { COLORS } from '@/constants/colors';
import { handleOAuthCallback } from '@/api/auth/authApi';

const OAuthWebView = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { url, provider } = (route.params as any) || {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const webViewRef = useRef<WebView>(null);

  // 무한 리다이렉트 방지를 위한 처리 완료 플래그
  const processedRef = useRef(false);

  const handleNavigationStateChange = async (navState: WebViewNavigation) => {
    const { url: currentUrl } = navState;
    console.log('[OAuthWebView] 현재 URL:', currentUrl);

    // 이미 처리 중이면 무시 (무한 리다이렉트 방지)
    if (isProcessing || processedRef.current) {
      console.log('[OAuthWebView] 이미 처리 중이므로 무시');
      return;
    }

    // 서버의 OAuth 성공 페이지 감지 (/login/oauth2/code/)
    // 백엔드 HTML이 자동으로 postMessage를 보내므로 여기서는 처리 중 플래그만 설정
    if (currentUrl.includes('/login/oauth2/code/')) {
      console.log('[OAuthWebView] OAuth 성공 페이지 감지 - 백엔드 postMessage 대기 중');
      setIsProcessing(true);
      processedRef.current = true;
      // 백엔드 HTML의 JavaScript가 자동으로 postMessage를 보내므로 추가 작업 불필요
    }

    // 에러 페이지 감지
    if (currentUrl.includes('error') || currentUrl.includes('denied') || currentUrl.includes('fail')) {
      console.log('[OAuthWebView] 에러 페이지 감지');
      setError('로그인이 취소되었거나 실패했습니다.');
      setIsProcessing(false);
    }
  };

  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('[OAuthWebView] WebView 메시지:', data);

      if ((data.type === 'OAUTH_TOKEN' || data.type === 'OAUTH_SUCCESS') && data.accessToken) {
        console.log('[OAuthWebView] 토큰 수신 성공');
        setIsProcessing(false);
        await handleOAuthCallback(undefined, undefined, data.accessToken, data.refreshToken);
        (navigation as any).reset({
          index: 0,
          routes: [{ name: 'MainPage' }],
        });
      } else if (data.type === 'OAUTH_ERROR') {
        setIsProcessing(false);
        throw new Error(data.error || '알 수 없는 오류');
      } else {
        console.warn('[OAuthWebView] 알 수 없는 메시지 타입:', data.type);
      }
    } catch (err) {
      console.error('[OAuthWebView] 메시지 처리 오류:', err);
      setError(err instanceof Error ? err.message : '로그인 처리 중 오류가 발생했습니다.');
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    (navigation as any).goBack();
  };

  if (!url) {
    return (
      <View style={styles.container}>
        <StyledText fontSize={16} fontWeight={500} color={COLORS.text.secondary}>
          로그인 URL이 없습니다.
        </StyledText>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <StyledText fontSize={14} fontWeight={500} color={COLORS.primary}>
            닫기
          </StyledText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <StyledText fontSize={16} fontWeight={500} color={COLORS.text.primary}>
            ✕
          </StyledText>
        </TouchableOpacity>
        <StyledText fontSize={18} fontWeight={600} color={COLORS.text.primary}>
          {provider === 'google' ? 'Google' : provider === 'apple' ? 'Apple' : 'Kakao'} 로그인
        </StyledText>
        <View style={{ width: 30 }} />
      </View>
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <StyledText fontSize={14} fontWeight={500} color={COLORS.text.secondary} style={{ marginTop: 16 }}>
            로그인 페이지를 불러오는 중...
          </StyledText>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <StyledText fontSize={16} fontWeight={500} color={COLORS.text.secondary}>
            {error}
          </StyledText>
          <TouchableOpacity onPress={handleClose} style={[styles.button, { marginTop: 16 }]}>
            <StyledText fontSize={14} fontWeight={500} color={COLORS.primary}>
              닫기
            </StyledText>
          </TouchableOpacity>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        onLoadStart={() => {
          setLoading(true);
          setError(null);
        }}
        onLoadEnd={() => {
          setLoading(false);
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('[OAuthWebView] WebView 오류:', nativeEvent);
          setError('페이지를 불러올 수 없습니다.');
          setLoading(false);
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.text.secondary + '20',
  },
  closeButton: {
    padding: 8,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    zIndex: 1,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 20,
    zIndex: 2,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
});

export default OAuthWebView;
