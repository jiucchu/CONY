import { PAYMENT_API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  PaymentReadyRequest,
  KakaoPayReadyResponse,
  KakaoPayApproveResponse,
} from '@/types/payment/payment';

interface ApiResponseData<T> {
  status: string;
  message: string;
  data: T;
}

// API 호출 헬퍼 함수
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponseData<T>> {
  const token = await AsyncStorage.getItem('accessToken');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${PAYMENT_API_BASE_URL}${endpoint}`, {
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
            if (errorJson.message) {
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

    const responseData: ApiResponseData<T> = await response.json();

    if (responseData.status !== 'SUCCESS') {
      throw new Error(
        responseData.message || `API Error: ${responseData.status}`
      );
    }

    return responseData;
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(
        `네트워크 오류: 서버에 연결할 수 없습니다. (${PAYMENT_API_BASE_URL}${endpoint})`
      );
    }
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      throw new Error(
        `서버 응답을 파싱할 수 없습니다. (${PAYMENT_API_BASE_URL}${endpoint})`
      );
    }
    throw error;
  }
}

/**
 * 결제 준비
 */
export const readyPayment = async (
  request: PaymentReadyRequest
): Promise<KakaoPayReadyResponse> => {
  const response = await apiCall<KakaoPayReadyResponse>(
    API_ENDPOINTS.PAYMENT_READY,
    {
      method: 'POST',
      body: JSON.stringify(request),
    }
  );
  return response.data;
};

/**
 * 결제 승인
 * React Native에서는 웹뷰를 통해 카카오페이 결제를 진행합니다.
 * pg_token은 웹뷰에서 리다이렉트된 URL에서 추출해야 합니다.
 */
export const approvePayment = async (
  pgToken: string,
  partnerOrderId: string
): Promise<KakaoPayApproveResponse> => {
  const params = new URLSearchParams();
  params.append('pg_token', pgToken);
  params.append('partner_order_id', partnerOrderId);

  const response = await fetch(
    `${PAYMENT_API_BASE_URL}${API_ENDPOINTS.PAYMENT_APPROVE}?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await AsyncStorage.getItem('accessToken')}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`결제 승인 실패: ${response.statusText}`);
  }

  // 결제 승인은 리다이렉트를 반환하므로, React Native에서는 웹뷰를 통해 처리해야 합니다.
  // 여기서는 성공 응답을 반환합니다.
  const responseData = await response.json();
  return responseData.data || responseData;
};

/**
 * 결제 취소
 */
export const cancelPayment = async (
  partnerOrderId?: string
): Promise<void> => {
  const params = new URLSearchParams();
  if (partnerOrderId) {
    params.append('partner_order_id', partnerOrderId);
  }

  await fetch(
    `${PAYMENT_API_BASE_URL}${API_ENDPOINTS.PAYMENT_CANCEL}?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await AsyncStorage.getItem('accessToken')}`,
      },
    }
  );
};

/**
 * 결제 실패
 */
export const failPayment = async (
  partnerOrderId?: string
): Promise<void> => {
  const params = new URLSearchParams();
  if (partnerOrderId) {
    params.append('partner_order_id', partnerOrderId);
  }

  await fetch(
    `${PAYMENT_API_BASE_URL}${API_ENDPOINTS.PAYMENT_FAIL}?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await AsyncStorage.getItem('accessToken')}`,
      },
    }
  );
};
