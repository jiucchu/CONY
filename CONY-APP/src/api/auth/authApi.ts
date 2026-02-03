import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ApiResponse } from '@/types/gifticon/gifticon';
import type { TokenResponseDto } from '@/types/auth/auth';

// API 호출 헬퍼 함수
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = await AsyncStorage.getItem('accessToken');
  const refreshToken = await AsyncStorage.getItem('refreshToken');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (refreshToken) {
    headers['Refresh-Token'] = refreshToken;
  }

  try {
    console.log(`[authApi] ${options.method || 'GET'} ${API_BASE_URL}${endpoint}`);
    // options에서 headers를 분리하여 헤더 병합 문제 방지 (HTTPS 환경에서 중요)
    const { headers: _, ...restOptions } = options;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...restOptions,
      headers,
    });

    console.log(`[authApi] 응답 상태: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorText = await response.text();
        console.error(`[authApi] 에러 응답 본문:`, errorText);
        if (errorText) {
          try {
            const errorJson = JSON.parse(errorText);
            console.error(`[authApi] 에러 JSON:`, errorJson);
            if (errorJson.head?.retmsg) {
              errorMessage = errorJson.head.retmsg;
            } else if (errorJson.message) {
              errorMessage = errorJson.message;
            } else if (errorJson.error) {
              errorMessage = errorJson.error;
            }
          } catch {
            if (errorText.length < 200) {
              errorMessage = errorText;
            }
          }
        }
      } catch {
        // 텍스트 파싱 실패 시 기본 메시지 사용
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`예상치 못한 응답 형식입니다. (Content-Type: ${contentType || '없음'})`);
    }

    const responseData: any = await response.json();

    // 두 가지 응답 형식 지원
    if (responseData.head) {
      if (responseData.head.retcode !== '200') {
        throw new Error(
          responseData.head.retmsg || `API Error: ${responseData.head.retcode}`
        );
      }
      return responseData as ApiResponse<T>;
    } else if (responseData.status && responseData.data !== undefined) {
      if (responseData.status !== 'SUCCESS') {
        throw new Error(
          responseData.message || `API Error: ${responseData.status}`
        );
      }
      return {
        head: {
          retcode: '200',
          retmsg: responseData.message || 'Success',
          timestamp: new Date().toISOString(),
        },
        body: responseData.data,
      } as ApiResponse<T>;
    } else {
      console.error('API 응답 형식 오류:', responseData);
      throw new Error('서버 응답 형식이 올바르지 않습니다.');
    }
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(
        `네트워크 오류: 서버에 연결할 수 없습니다. (${API_BASE_URL}${endpoint})`
      );
    }
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      throw new Error(
        `서버 응답을 파싱할 수 없습니다. (${API_BASE_URL}${endpoint})`
      );
    }
    throw error;
  }
}

/**
 * OAuth 로그인 URL 가져오기
 * Spring Security OAuth2의 기본 경로 사용
 */
export const getOAuthLoginUrl = (provider: 'google' | 'apple' | 'kakao'): string => {
  // Spring Security OAuth2의 기본 authorization 엔드포인트 사용
  // /oauth2/authorization/{provider} 형식
  const providerName = provider.toLowerCase();
  return `${API_BASE_URL}/oauth2/authorization/${providerName}`;
};

/**
 * OAuth 콜백에서 토큰 처리
 */
export const handleOAuthCallback = async (code?: string, state?: string, accessToken?: string, refreshToken?: string): Promise<TokenResponseDto> => {
  // URL에서 직접 토큰을 받은 경우
  if (accessToken) {
    const tokenData: TokenResponseDto = {
      accessToken,
      refreshToken: refreshToken || '',
      tokenType: 'Bearer',
      expiresIn: 3600,
    };
    
    await AsyncStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      await AsyncStorage.setItem('refreshToken', refreshToken);
    }
    
    return tokenData;
  }

  // 코드를 사용하여 서버에서 토큰 가져오기
  if (!code) {
    throw new Error('인증 코드가 없습니다.');
  }

  const params = new URLSearchParams();
  params.append('code', code);
  if (state) params.append('state', state);
  // redirectUri도 함께 전달 (서버에서 필요할 수 있음)
  const redirectUri = 'conyapp://oauth/callback';
  params.append('redirectUri', redirectUri);

  const callbackUrl = `${API_ENDPOINTS.AUTH_OAUTH_CALLBACK}?${params.toString()}`;
  console.log('[handleOAuthCallback] 토큰 요청 URL:', callbackUrl);
  console.log('[handleOAuthCallback] API_BASE_URL:', API_BASE_URL);
  console.log('[handleOAuthCallback] 전체 URL:', `${API_BASE_URL}${callbackUrl}`);
  console.log('[handleOAuthCallback] 파라미터:', { code, state, redirectUri });

  try {
    const response = await apiCall<TokenResponseDto>(
      callbackUrl,
      { method: 'GET' }
    );

    console.log('[handleOAuthCallback] 응답 전체:', JSON.stringify(response, null, 2));
    console.log('[handleOAuthCallback] response.body:', response.body);

    // 응답 형식 확인 및 처리
    let tokenData: TokenResponseDto | null = null;

    if (response.body) {
      // body가 직접 TokenResponseDto인 경우
      if (typeof response.body === 'object' && 'accessToken' in response.body) {
        tokenData = response.body as TokenResponseDto;
      } else if (typeof response.body === 'object' && 'data' in response.body) {
        // body.data에 토큰이 있는 경우
        tokenData = (response.body as any).data as TokenResponseDto;
      }
    }

    if (!tokenData || !tokenData.accessToken) {
      console.error('[handleOAuthCallback] 토큰 데이터 없음:', response);
      throw new Error('토큰을 받을 수 없습니다. 서버 응답 형식을 확인해주세요.');
    }

    console.log('[handleOAuthCallback] 토큰 추출 성공:', { 
      hasAccessToken: !!tokenData.accessToken, 
      hasRefreshToken: !!tokenData.refreshToken 
    });
    
    // 토큰 저장
    await AsyncStorage.setItem('accessToken', tokenData.accessToken);
    if (tokenData.refreshToken) {
      await AsyncStorage.setItem('refreshToken', tokenData.refreshToken);
    }

    return tokenData;
  } catch (error) {
    console.error('[handleOAuthCallback] 에러 상세:', error);
    if (error instanceof Error) {
      console.error('[handleOAuthCallback] 에러 메시지:', error.message);
      console.error('[handleOAuthCallback] 에러 스택:', error.stack);
    }
    throw error;
  }
};

/**
 * 토큰 재발급
 */
export const reissueToken = async (): Promise<TokenResponseDto> => {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    throw new Error('리프레시 토큰이 없습니다.');
  }

  const response = await apiCall<TokenResponseDto>(
    API_ENDPOINTS.AUTH_REISSUE,
    {
      method: 'POST',
      headers: {
        'Refresh-Token': refreshToken,
      },
    }
  );

  const tokenData = response.body as TokenResponseDto;
  
  // 새 토큰 저장
  if (tokenData.accessToken) {
    await AsyncStorage.setItem('accessToken', tokenData.accessToken);
  }
  if (tokenData.refreshToken) {
    await AsyncStorage.setItem('refreshToken', tokenData.refreshToken);
  }

  return tokenData;
};
