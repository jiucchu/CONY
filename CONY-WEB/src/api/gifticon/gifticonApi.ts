import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import type {
  ApiResponse,
  ApiResponseData,
  GifticonDetailResponseDto,
  GifticonRegisterRequestDto,
  GifticonUpdateRequestDto,
  GifticonUseRequestDto,
  GifticonLogUpdateRequestDto,
  GifticonAnalysisResponseDto,
  Pageable,
  PageGifticonListResponseDto,
} from '@/types/gifticon/gifticon';

// API 호출 헬퍼 함수 (규격서에 따른 응답 형식 처리)
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
            } else if (errorJson.error) {
              errorMessage = errorJson.error;
            }
            // 에러 상세 정보 로깅
            console.error('API Error Response:', {
              endpoint,
              status: response.status,
              error: errorJson
            });
          } catch {
            // JSON이 아니면 텍스트 그대로 사용
            if (errorText.length < 200) {
              errorMessage = errorText;
            }
            console.error('API Error Text:', errorText);
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

// FormData를 사용하는 API 호출 (규격서에 따른 응답 형식 처리)
async function apiCallFormData<T>(
  endpoint: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('accessToken') 
    : null;

  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
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
 * 기프티콘 상세 조회
 */
export const getGifticonDetail = async (
  gifticonId: number
): Promise<GifticonDetailResponseDto> => {
  const response = await apiCall<GifticonDetailResponseDto>(
    API_ENDPOINTS.GIFTCON_DETAIL(gifticonId),
    { method: 'GET' }
  );
  return response.body as GifticonDetailResponseDto;
};

/**
 * 내 기프티콘 목록 조회 (페이징)
 */
export const getMyGifticons = async (
  pageable: Pageable = { page: 0, size: 10 },
  condition?: {
    expiringSoon?: boolean;
    excludeUsed?: boolean;
    categoryId?: number;
    latitude?: number;
    longitude?: number;
    radius?: number;
  }
): Promise<PageGifticonListResponseDto> => {
  const params = new URLSearchParams();
  if (pageable.page !== undefined) params.append('page', pageable.page.toString());
  if (pageable.size !== undefined) params.append('size', pageable.size.toString());
  if (pageable.sort) {
    pageable.sort.forEach(sort => params.append('sort', sort));
  }

  // 검색 조건 추가
  if (condition) {
    if (condition.expiringSoon !== undefined) {
      params.append('expiringSoon', condition.expiringSoon.toString());
    }
    if (condition.excludeUsed !== undefined) {
      params.append('excludeUsed', condition.excludeUsed.toString());
    }
    if (condition.categoryId !== undefined) {
      params.append('categoryId', condition.categoryId.toString());
    }
    if (condition.latitude !== undefined) {
      params.append('latitude', condition.latitude.toString());
    }
    if (condition.longitude !== undefined) {
      params.append('longitude', condition.longitude.toString());
    }
    if (condition.radius !== undefined) {
      params.append('radius', condition.radius.toString());
    }
  }

  const response = await apiCall<PageGifticonListResponseDto>(
    `${API_ENDPOINTS.GIFTCONS}?${params.toString()}`,
    { method: 'GET' }
  );

  return response.body as PageGifticonListResponseDto;
};

/**
 * 기프티콘 등록
 */
export const registerGifticons = async (
  gifticons: GifticonRegisterRequestDto[]
): Promise<number[]> => {
  const response = await apiCall<number[]>(
    API_ENDPOINTS.GIFTCONS,
    {
      method: 'POST',
      body: JSON.stringify(gifticons),
    }
  );
  return (response.body as number[]) || [];
};

/**
 * 기프티콘 정보 수정
 */
export const updateGifticonInfo = async (
  gifticonId: number,
  updateData: GifticonUpdateRequestDto
): Promise<number> => {
  const response = await apiCall<number>(
    API_ENDPOINTS.GIFTCON_DETAIL(gifticonId),
    {
      method: 'PUT',
      body: JSON.stringify(updateData),
    }
  );
  return (response.body as number) || gifticonId;
};

/**
 * 기프티콘 사용
 */
export const useGifticon = async (
  gifticonId: number,
  useData: GifticonUseRequestDto
): Promise<number> => {
  const response = await apiCall<number>(
    API_ENDPOINTS.GIFTCON_USE(gifticonId),
    {
      method: 'POST',
      body: JSON.stringify(useData),
    }
  );
  return (response.body as number) || gifticonId;
};

/**
 * 기프티콘 사용 내역 수정
 */
export const updateUseLog = async (
  logId: number,
  updateData: GifticonLogUpdateRequestDto
): Promise<void> => {
  await apiCall<null>(
    API_ENDPOINTS.GIFTCON_LOG_UPDATE(logId),
    {
      method: 'PUT',
      body: JSON.stringify(updateData),
    }
  );
};

/**
 * 기프티콘 사용 취소
 */
export const cancelUseGifticon = async (
  logId: number
): Promise<void> => {
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('accessToken') 
    : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GIFTCON_LOG_CANCEL(logId)}`, {
      method: 'POST',
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
            if (errorJson.message) {
              errorMessage = errorJson.message;
            } else if (errorJson.status) {
              errorMessage = errorJson.status;
            }
            console.error('사용 취소 API 에러:', {
              logId,
              status: response.status,
              error: errorJson
            });
          } catch {
            if (errorText.length < 200) {
              errorMessage = errorText;
            }
          }
        }
      } catch {
        // 에러 처리 실패
      }
      
      // 상태 코드별 에러 메시지
      if (response.status === 400) {
        throw new Error('이미 취소된 사용 내역입니다.');
      } else if (response.status === 404) {
        throw new Error('사용 내역을 찾을 수 없습니다.');
      }
      
      throw new Error(errorMessage);
    }

    // 성공 응답 처리 (본문이 없을 수 있음)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const responseData = await response.json();
      if (responseData.status && responseData.status !== 'SUCCESS') {
        throw new Error(responseData.message || '사용 취소에 실패했습니다.');
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('사용 취소 중 오류가 발생했습니다.');
  }
};

/**
 * 기프티콘 이미지 분석
 */
export const analyzeGifticon = async (
  images: File[]
): Promise<GifticonAnalysisResponseDto[]> => {
  const formData = new FormData();
  images.forEach((image) => {
    formData.append('images', image);
  });

  const response = await apiCallFormData<GifticonAnalysisResponseDto[]>(
    API_ENDPOINTS.GIFTCON_ANALYZE,
    formData
  );
  return (response.body as GifticonAnalysisResponseDto[]) || [];
};

/**
 * Health Check
 */
export const healthCheck = async (): Promise<string> => {
  const response = await apiCall<string>(
    API_ENDPOINTS.HEALTH_CHECK,
    { method: 'GET' }
  );
  return (response.body as string) || 'OK';
};
