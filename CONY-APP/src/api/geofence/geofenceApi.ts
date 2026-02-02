import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GeofenceRequestDto, GeofenceResponseDto } from '@/types/geofence/geofence';

interface ApiResponseData<T> {
  status: string;
  message: string;
  data: T;
}

// API 호출 헬퍼 함수 (웹과 동일한 형식)
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
            if (errorJson.message) {
              errorMessage = errorJson.message;
            } else if (errorJson.error) {
              errorMessage = errorJson.error;
            }
            console.error('API Error Response:', {
              endpoint,
              status: response.status,
              error: errorJson
            });
          } catch {
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

    const responseData: ApiResponseData<T> = await response.json();

    // status가 SUCCESS가 아니면 에러 처리
    if (responseData.status !== 'SUCCESS') {
      throw new Error(responseData.message || `API Error: ${responseData.status}`);
    }

    return responseData;
  } catch (error: any) {
    console.error('API 호출 실패:', {
      endpoint,
      error: error.message || error
    });
    throw error;
  }
}

/**
 * 주변 매장 검색 (Geofence)
 * 사용자 위치 기준 반경 내 매장을 검색합니다.
 */
export const getNearbyStores = async (
  request: GeofenceRequestDto
): Promise<GeofenceResponseDto> => {
  // GPS 검증 제거 (에뮬레이터에서 GPS가 이상하게 동작할 수 있음)
  // 서버에서 검증하도록 함
  
  console.log('[getNearbyStores] 위치 요청:', { lat: request.lat, lon: request.lon });

  const response = await apiCall<GeofenceResponseDto>(
    API_ENDPOINTS.GEOFENCE_NEARBY,
    {
      method: 'POST',
      body: JSON.stringify(request),
    }
  );

  return response.data;
};
