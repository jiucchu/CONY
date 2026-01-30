import { API_BASE_URL } from '@/constants/api';
import type { ApiResponse } from '@/types/gifticon/gifticon';
import type { UserInfo } from '@/types/user/user';

// API 호출 헬퍼 함수
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('accessToken') 
    : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // HTTP 상태 코드 확인
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
            // JSON이 아니면 텍스트 그대로 사용
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

    // 응답 본문이 있는지 확인
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`예상치 못한 응답 형식입니다. (Content-Type: ${contentType || '없음'})`);
    }

    const responseData: any = await response.json();

    // 두 가지 응답 형식 지원: { head, body } 또는 { status, message, data }
    if (responseData.head) {
      // 기존 형식: { head: { retcode, retmsg }, body }
      if (responseData.head.retcode !== '200') {
        throw new Error(
          responseData.head.retmsg || `API Error: ${responseData.head.retcode}`
        );
      }
      return responseData as ApiResponse<T>;
    } else if (responseData.status && responseData.data !== undefined) {
      // 새로운 형식: { status, message, data }
      if (responseData.status !== 'SUCCESS') {
        throw new Error(
          responseData.message || `API Error: ${responseData.status}`
        );
      }
      // ApiResponse 형식으로 변환
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
      throw new Error(
        `서버 응답 형식이 올바르지 않습니다.`
      );
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
 * 사용자 정보 조회
 */
export const getUserInfo = async (): Promise<UserInfo> => {
  const response = await apiCall<UserInfo>('/v1/users/me', { method: 'GET' });
  return response.body as UserInfo;
};
