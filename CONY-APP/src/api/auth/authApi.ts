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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorText = await response.text();
        if (errorText) {
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.head?.retmsg) {
              errorMessage = errorJson.head.retmsg;
            } else if (errorJson.message) {
              errorMessage = errorJson.message;
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
