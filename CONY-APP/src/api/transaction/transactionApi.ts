import { PAYMENT_API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  TransactionResponse,
  PageTransactionResponse,
  TransactionType,
} from '@/types/transaction/transaction';

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
 * 거래 내역 조회
 */
export const getTransactions = async (
  page?: number,
  size?: number,
  type?: TransactionType
): Promise<PageTransactionResponse> => {
  const params = new URLSearchParams();
  if (page !== undefined) params.append('page', page.toString());
  if (size !== undefined) params.append('size', size.toString());
  if (type) params.append('type', type);

  const response = await apiCall<PageTransactionResponse>(
    `${API_ENDPOINTS.TRANSACTIONS}?${params.toString()}`,
    { method: 'GET' }
  );
  return response.data;
};

/**
 * 거래 내역 상세 조회
 */
export const getTransaction = async (
  transactionId: number
): Promise<TransactionResponse> => {
  const response = await apiCall<TransactionResponse>(
    API_ENDPOINTS.TRANSACTION_DETAIL(transactionId),
    { method: 'GET' }
  );
  return response.data;
};

/**
 * 최근 거래 내역 조회
 */
export const getRecentTransactions = async (): Promise<TransactionResponse[]> => {
  const response = await apiCall<TransactionResponse[]>(
    API_ENDPOINTS.TRANSACTIONS_RECENT,
    { method: 'GET' }
  );
  return response.data;
};
