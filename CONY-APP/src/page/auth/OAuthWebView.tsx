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
    if (currentUrl.includes('/login/oauth2/code/')) {
      console.log('[OAuthWebView] OAuth 성공 페이지 감지');
      setIsProcessing(true);
      processedRef.current = true;

      // WebView에서 HTML 내용을 읽어서 토큰 추출 시도
      try {
        // JavaScript를 실행하여 HTML에서 토큰 추출
        const script = `
          (function() {
            try {
              // 서버가 반환하는 HTML에서 JSON 데이터 찾기
              const scripts = document.getElementsByTagName('script');
              for (let i = 0; i < scripts.length; i++) {
                const scriptContent = scripts[i].innerHTML;
                if (scriptContent.includes('OAUTH_SUCCESS') || scriptContent.includes('accessToken')) {
                  // postMessage에서 토큰 추출 시도
                  const match = scriptContent.match(/accessToken['"]\\s*:\\s*['"]([^'"]+)['"]/);
                  if (match && match[1]) {
                    return JSON.stringify({
                      accessToken: match[1],
                      refreshToken: scriptContent.match(/refreshToken['"]\\s*:\\s*['"]([^'"]+)['"]/)?.[1] || ''
                    });
                  }
                }
              }
              return null;
            } catch(e) {
              return null;
            }
          })();
        `;

        // WebView에서 JavaScript 실행하여 토큰 추출
        webViewRef.current?.injectJavaScript(`
          (function() {
            try {
              const scripts = document.getElementsByTagName('script');
              for (let i = 0; i < scripts.length; i++) {
                const scriptContent = scripts[i].innerHTML;
                if (scriptContent.includes('OAUTH_SUCCESS') || scriptContent.includes('accessToken')) {
                  const accessTokenMatch = scriptContent.match(/accessToken['"]\\s*:\\s*['"]([^'"]+)['"]/);
                  const refreshTokenMatch = scriptContent.match(/refreshToken['"]\\s*:\\s*['"]([^'"]+)['"]/);
                  if (accessTokenMatch && accessTokenMatch[1]) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'OAUTH_TOKEN',
                      accessToken: accessTokenMatch[1],
                      refreshToken: refreshTokenMatch?.[1] || ''
                    }));
                    return;
                  }
                }
              }
              // 토큰을 찾지 못한 경우 서버 API 호출 시도
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'OAUTH_NEED_API_CALL',
                url: '${currentUrl}'
              }));
            } catch(e) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'OAUTH_ERROR',
                error: e.message
              }));
            }
          })();
          true;
        `);
      } catch (err) {
        console.error('[OAuthWebView] 토큰 추출 오류:', err);
        setError('로그인 처리 중 오류가 발생했습니다.');
        setIsProcessing(false);
      }
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

      if (data.type === 'OAUTH_TOKEN' && data.accessToken) {
        console.log('[OAuthWebView] 토큰 수신 성공');
        await handleOAuthCallback(undefined, undefined, data.accessToken, data.refreshToken);
        (navigation as any).reset({
          index: 0,
          routes: [{ name: 'MainPage' }],
        });
      } else if (data.type === 'OAUTH_NEED_API_CALL') {
        // 서버 API를 통해 토큰 가져오기
        console.log('[OAuthWebView] 서버 API 호출 필요');
        // React Native에서 URLSearchParams.get이 지원되지 않을 수 있으므로 직접 파싱
        const urlString = data.url;
        const urlMatch = urlString.match(/[?&]code=([^&]+)/);
        const code = urlMatch ? urlMatch[1] : null;
        if (code) {
          await handleOAuthCallback(code, undefined);
          (navigation as any).reset({
            index: 0,
            routes: [{ name: 'MainPage' }],
          });
        } else {
          throw new Error('인증 코드를 찾을 수 없습니다.');
        }
      } else if (data.type === 'OAUTH_ERROR') {
        throw new Error(data.error || '알 수 없는 오류');
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
