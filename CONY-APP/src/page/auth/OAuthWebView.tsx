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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleNavigationStateChange = async (navState: WebViewNavigation) => {
    const { url: currentUrl } = navState;
    console.log('[OAuthWebView] 현재 URL:', currentUrl);

    // 이미 처리 중이면 무시 (무한 리다이렉트 방지)
    if (isProcessing || processedRef.current) {
      console.log('[OAuthWebView] 이미 처리 중이므로 무시');
      return;
    }

    // 서버의 OAuth 성공 페이지 감지 (/login/oauth2/code/)
    if (currentUrl.includes('/login/oauth2/code/') || currentUrl.includes('/api/manage/login/oauth2/code/')) {
      console.log('[OAuthWebView] OAuth 성공 페이지 감지 - 토큰 추출 시도');
      setIsProcessing(true);
      processedRef.current = true;
      
      // 즉시 HTML에서 토큰 추출 시도
      setTimeout(() => {
        webViewRef.current?.injectJavaScript(`
          (function() {
            try {
              // 먼저 기존 스크립트가 postMessage를 보냈는지 확인
              // HTML의 script 태그에서 토큰 추출
              const scripts = document.getElementsByTagName('script');
              for (let i = 0; i < scripts.length; i++) {
                const scriptContent = scripts[i].innerHTML;
                if (scriptContent.includes('accessToken') || scriptContent.includes('OAUTH_SUCCESS')) {
                  // JSON 객체에서 토큰 추출
                  const jsonMatch = scriptContent.match(/const res = ({[^}]+(?:{[^}]+})*[^}]+})/);
                  if (jsonMatch) {
                    try {
                      const res = eval('(' + jsonMatch[1] + ')');
                      if (res && res.data && res.data.accessToken) {
                        if (window.ReactNativeWebView) {
                          window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'OAUTH_SUCCESS',
                            accessToken: res.data.accessToken,
                            refreshToken: res.data.refreshToken || ''
                          }));
                          return;
                        }
                      }
                    } catch (e) {
                      console.log('JSON 파싱 실패, 정규식으로 추출 시도');
                    }
                  }
                  
                  // 정규식으로 직접 추출 시도
                  const accessTokenMatch = scriptContent.match(/accessToken['"]\\s*:\\s*['"]([^'"]+)['"]/);
                  const refreshTokenMatch = scriptContent.match(/refreshToken['"]\\s*:\\s*['"]([^'"]+)['"]/);
                  if (accessTokenMatch && accessTokenMatch[1]) {
                    if (window.ReactNativeWebView) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'OAUTH_SUCCESS',
                        accessToken: accessTokenMatch[1],
                        refreshToken: refreshTokenMatch && refreshTokenMatch[1] ? refreshTokenMatch[1] : ''
                      }));
                      return;
                    }
                  }
                }
              }
              
              // postMessage가 전달되지 않았다면 재시도
              console.log('토큰을 찾지 못했습니다. 재시도합니다...');
            } catch (e) {
              console.error('토큰 추출 오류:', e);
            }
          })();
          true; // injectedJavaScript는 반환값이 필요함
        `);
      }, 500); // 페이지 로드 후 500ms 대기
      
      // 타임아웃 설정: 3초 후에도 메시지를 받지 못하면 에러
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        if (!processedRef.current) {
          console.warn('[OAuthWebView] 타임아웃: postMessage를 받지 못했습니다.');
          setError('로그인 처리 시간이 초과되었습니다. 다시 시도해주세요.');
          setIsProcessing(false);
          processedRef.current = false;
        }
      }, 3000);
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
      console.log('[OAuthWebView] 원본 메시지 수신:', event.nativeEvent.data);
      const data = JSON.parse(event.nativeEvent.data);
      console.log('[OAuthWebView] 파싱된 WebView 메시지:', data);

      if ((data.type === 'OAUTH_TOKEN' || data.type === 'OAUTH_SUCCESS') && data.accessToken) {
        console.log('[OAuthWebView] 토큰 수신 성공, 토큰 저장 중...');
        
        // 타임아웃 취소
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        setIsProcessing(false);
        processedRef.current = false;
        
        try {
          await handleOAuthCallback(undefined, undefined, data.accessToken, data.refreshToken);
          console.log('[OAuthWebView] 토큰 저장 완료, 메인 페이지로 이동');
          
          // WebView를 먼저 닫고 메인 페이지로 이동
          // replace를 사용하여 스택을 완전히 교체
          setTimeout(() => {
            console.log('[OAuthWebView] 네비게이션 실행');
            (navigation as any).replace('MainPage');
          }, 200);
        } catch (tokenError) {
          console.error('[OAuthWebView] 토큰 저장 오류:', tokenError);
          setError('토큰 저장 중 오류가 발생했습니다.');
          setIsProcessing(false);
          processedRef.current = false;
        }
      } else if (data.type === 'OAUTH_ERROR') {
        setIsProcessing(false);
        processedRef.current = false;
        throw new Error(data.error || '알 수 없는 오류');
      } else {
        console.warn('[OAuthWebView] 알 수 없는 메시지 타입:', data.type, '전체 데이터:', data);
      }
    } catch (err) {
      console.error('[OAuthWebView] 메시지 처리 오류:', err);
      setError(err instanceof Error ? err.message : '로그인 처리 중 오류가 발생했습니다.');
      setIsProcessing(false);
      processedRef.current = false;
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
        onLoadEnd={(syntheticEvent) => {
          setLoading(false);
          const { nativeEvent } = syntheticEvent;
          const url = nativeEvent.url;
          console.log('[OAuthWebView] 페이지 로드 완료:', url);
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
        injectedJavaScript={`
          // 모든 페이지에서 OAuth 성공 페이지를 감지하고 토큰 추출
          (function() {
            const checkForTokens = () => {
              try {
                const scripts = document.getElementsByTagName('script');
                for (let i = 0; i < scripts.length; i++) {
                  const scriptContent = scripts[i].innerHTML;
                  if (scriptContent.includes('accessToken') || scriptContent.includes('OAUTH_SUCCESS')) {
                    // JSON 객체에서 토큰 추출 시도
                    const jsonMatch = scriptContent.match(/const res = ({[^}]+(?:{[^}]+})*[^}]+})/);
                    if (jsonMatch) {
                      try {
                        const res = eval('(' + jsonMatch[1] + ')');
                        if (res && res.data && res.data.accessToken) {
                          if (window.ReactNativeWebView) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                              type: 'OAUTH_SUCCESS',
                              accessToken: res.data.accessToken,
                              refreshToken: res.data.refreshToken || ''
                            }));
                            return;
                          }
                        }
                      } catch (e) {
                        // JSON 파싱 실패 시 정규식으로 추출
                      }
                    }
                    
                    // 정규식으로 직접 추출
                    const accessTokenMatch = scriptContent.match(/accessToken['"]\\s*:\\s*['"]([^'"]+)['"]/);
                    const refreshTokenMatch = scriptContent.match(/refreshToken['"]\\s*:\\s*['"]([^'"]+)['"]/);
                    if (accessTokenMatch && accessTokenMatch[1] && window.ReactNativeWebView) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'OAUTH_SUCCESS',
                        accessToken: accessTokenMatch[1],
                        refreshToken: refreshTokenMatch && refreshTokenMatch[1] ? refreshTokenMatch[1] : ''
                      }));
                      return;
                    }
                  }
                }
              } catch (e) {
                console.error('토큰 추출 오류:', e);
              }
            };
            
            // DOMContentLoaded 이벤트에서 확인
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', checkForTokens);
            } else {
              checkForTokens();
            }
            
            // MutationObserver로 동적으로 추가되는 스크립트도 감지
            const observer = new MutationObserver(checkForTokens);
            observer.observe(document.body || document.documentElement, {
              childList: true,
              subtree: true
            });
          })();
          true;
        `}
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
