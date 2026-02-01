import { PAYMENT_API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  SaleListResponseDto,
  SaleRequestDto,
  SaleUpdateRequestDto,
  SaleSearchCondition,
  SaleStatsDto,
  PageSaleListResponseDto,
  SaleStatus,
} from '@/types/sale/sale';
import type { Pageable } from '@/types/gifticon/gifticon';

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
 * 판매글 등록
 */
export const createSale = async (
  request: SaleRequestDto
): Promise<number> => {
  const response = await apiCall<number>(
    API_ENDPOINTS.SALES,
    {
      method: 'POST',
      body: JSON.stringify(request),
    }
  );
  return response.data;
};

/**
 * 판매 목록 조회
 */
export const getSalesOnSale = async (
  condition?: SaleSearchCondition,
  pageable?: Pageable
): Promise<PageSaleListResponseDto> => {
  const params = new URLSearchParams();
  if (condition?.keyword) params.append('keyword', condition.keyword);
  if (condition?.category) params.append('category', condition.category);
  if (condition?.brand) params.append('brand', condition.brand);
  if (condition?.sort) params.append('sort', condition.sort);
  if (condition?.latitude !== undefined) params.append('latitude', condition.latitude.toString());
  if (condition?.longitude !== undefined) params.append('longitude', condition.longitude.toString());
  if (pageable?.page !== undefined) params.append('page', pageable.page.toString());
  if (pageable?.size !== undefined) params.append('size', pageable.size.toString());
  if (pageable?.sort) {
    pageable.sort.forEach(sort => params.append('sort', sort));
  }

  const response = await apiCall<PageSaleListResponseDto>(
    `${API_ENDPOINTS.SALES}?${params.toString()}`,
    { method: 'GET' }
  );
  return response.data;
};

/**
 * 판매글 상세 조회
 */
export const getSaleDetail = async (
  saleId: number
): Promise<SaleListResponseDto> => {
  const response = await apiCall<SaleListResponseDto>(
    API_ENDPOINTS.SALE_DETAIL(saleId),
    { method: 'GET' }
  );
  return response.data;
};

/**
 * 판매글 수정
 */
export const updateSale = async (
  saleId: number,
  request: SaleUpdateRequestDto
): Promise<void> => {
  await apiCall<void>(
    API_ENDPOINTS.SALE_DETAIL(saleId),
    {
      method: 'PUT',
      body: JSON.stringify(request),
    }
  );
};

/**
 * 내 판매 목록 조회
 */
export const getMySales = async (
  status?: SaleStatus,
  keyword?: string,
  pageable?: Pageable
): Promise<PageSaleListResponseDto> => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (keyword) params.append('keyword', keyword);
  if (pageable?.page !== undefined) params.append('page', pageable.page.toString());
  if (pageable?.size !== undefined) params.append('size', pageable.size.toString());
  if (pageable?.sort) {
    pageable.sort.forEach(sort => params.append('sort', sort));
  }

  const response = await apiCall<PageSaleListResponseDto>(
    `${API_ENDPOINTS.SALE_MY}?${params.toString()}`,
    { method: 'GET' }
  );
  return response.data;
};

/**
 * 내 판매 통계 조회
 */
export const getMySaleStats = async (): Promise<SaleStatsDto> => {
  const response = await apiCall<SaleStatsDto>(
    API_ENDPOINTS.SALE_MY_STATS,
    { method: 'GET' }
  );
  return response.data;
};

/**
 * 내 판매 완료 목록 조회
 */
export const getMySoldSales = async (
  pageable?: Pageable
): Promise<PageSaleListResponseDto> => {
  const params = new URLSearchParams();
  if (pageable?.page !== undefined) params.append('page', pageable.page.toString());
  if (pageable?.size !== undefined) params.append('size', pageable.size.toString());
  if (pageable?.sort) {
    pageable.sort.forEach(sort => params.append('sort', sort));
  }

  const response = await apiCall<PageSaleListResponseDto>(
    `${API_ENDPOINTS.SALE_MY_SOLD}?${params.toString()}`,
    { method: 'GET' }
  );
  return response.data;
};

/**
 * 브랜드 목록 조회
 */
export const getSaleBrands = async (): Promise<string[]> => {
  const response = await apiCall<string[]>(
    API_ENDPOINTS.SALE_BRANDS,
    { method: 'GET' }
  );
  return response.data;
};

/**
 * 판매 제안 목록 조회
 */
export const getSaleSuggestions = async (): Promise<SaleListResponseDto[]> => {
  const response = await apiCall<SaleListResponseDto[]>(
    API_ENDPOINTS.SALE_SUGGESTIONS,
    { method: 'GET' }
  );
  return response.data;
};

/**
 * 판매 시작
 */
export const startSale = async (saleId: number): Promise<void> => {
  await apiCall<void>(
    API_ENDPOINTS.SALE_START(saleId),
    { method: 'POST' }
  );
};

/**
 * 판매 취소
 */
export const cancelSale = async (saleId: number): Promise<void> => {
  await apiCall<void>(
    API_ENDPOINTS.SALE_DETAIL(saleId),
    { method: 'DELETE' }
  );
};
