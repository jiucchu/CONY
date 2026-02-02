import { API_BASE_URL } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ApiResponse } from '@/types/gifticon/gifticon';
import type { UserInfo } from '@/types/user/user';

// API 호출 헬퍼 함수
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = await AsyncStorage.getItem('accessToken');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`[userApi] ${options.method || 'GET'} ${url}`);
  console.log(`[userApi] 토큰 존재:`, !!token);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    console.log(`[userApi] 응답 상태: ${response.status} ${response.statusText}`);

    // HTTP 상태 코드 확인
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorText = await response.text();
        console.error('[userApi] 에러 응답 본문:', errorText);
        if (errorText) {
          try {
            const errorJson = JSON.parse(errorText);
            console.error('[userApi] 에러 JSON:', errorJson);
            if (errorJson.head?.retmsg) {
              errorMessage = errorJson.head.retmsg;
            } else if (errorJson.message) {
              errorMessage = errorJson.message;
            } else if (errorJson.error) {
              errorMessage = errorJson.error;
            }
          } catch {
            // JSON이 아니면 텍스트 그대로 사용
            if (errorText.length < 500) {
              errorMessage = errorText;
            }
          }
        }
      } catch (err) {
        console.error('[userApi] 에러 텍스트 파싱 실패:', err);
        // 텍스트 파싱 실패 시 기본 메시지 사용
      }
      throw new Error(errorMessage);
    }

    // 응답 본문이 있는지 확인
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`예상치 못한 응답 형식입니다. (Content-Type: ${contentType || '없음'})`);
    }

    const responseData: ApiResponse<T> = await response.json();

    // retcode가 200이 아니면 에러 처리
    if (responseData.head.retcode !== '200') {
      throw new Error(
        responseData.head.retmsg || `API Error: ${responseData.head.retcode}`
      );
    }

    return responseData;
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
 * 사용자 정보 조회
 */
export const getUserInfo = async (): Promise<UserInfo> => {
  const response = await apiCall<UserInfo>('/v1/users/me', { method: 'GET' });
  return response.body as UserInfo;
};
