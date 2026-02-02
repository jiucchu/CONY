import { API_BASE_URL, API_ENDPOINTS, LOCAL_HOST, LOCAL_MANAGE_PORT } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  ApiResponse,
  GifticonDetailResponseDto,
  GifticonRegisterRequestDto,
  GifticonUpdateRequestDto,
  GifticonUseRequestDto,
  GifticonLogUpdateRequestDto,
  GifticonAnalysisResponseDto,
  Pageable,
  PageGifticonListResponseDto,
  GifticonListResponseDto,
  GifticonSearchCondition,
} from '@/types/gifticon/gifticon';

// API 호출 헬퍼 함수 (규격서에 따른 응답 형식 처리)
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
    console.log(`[Gifticon API] 토큰 존재: ${token.substring(0, 20)}... (전체 길이: ${token.length})`);
  } else {
    console.warn(`[Gifticon API] ⚠️ 토큰이 없습니다!`);
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[Gifticon API] ${options.method || 'GET'} ${url}`);
    console.log(`[Gifticon API] API_BASE_URL: ${API_BASE_URL}`);
    console.log(`[Gifticon API] Request headers:`, JSON.stringify(headers, null, 2));
    console.log(`[Gifticon API] Authorization 헤더 존재:`, !!headers['Authorization']);
    console.log(`[Gifticon API] Request body:`, options.body);
    const response = await fetch(url, {
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

    const responseData: any = await response.json();
    console.log('[apiCall] 원본 응답 데이터:', JSON.stringify(responseData, null, 2));

    // 두 가지 응답 형식 지원: { head, body } 또는 { status, message, data }
    if (responseData.head) {
      // 기존 형식: { head: { retcode, retmsg }, body }
      if (responseData.head.retcode !== '200') {
        throw new Error(
          responseData.head.retmsg || `API Error: ${responseData.head.retcode}`
        );
      }
      console.log('[apiCall] head 형식 응답, body:', responseData.body);
      return responseData as ApiResponse<T>;
    } else if (responseData.status && responseData.data !== undefined) {
      // 새로운 형식: { status, message, data }
      if (responseData.status !== 'SUCCESS') {
        throw new Error(
          responseData.message || `API Error: ${responseData.status}`
        );
      }
      // ApiResponse 형식으로 변환
      console.log('[apiCall] status 형식 응답, data:', responseData.data);
      return {
        head: {
          retcode: '200',
          retmsg: responseData.message || 'Success',
          timestamp: new Date().toISOString(),
        },
        body: responseData.data,
      } as ApiResponse<T>;
    } else if (responseData.content !== undefined) {
      // Spring Page 형식으로 직접 응답: { content: [...], totalElements: ... }
      console.log('[apiCall] Spring Page 형식 직접 응답, content:', responseData.content);
      return {
        head: {
          retcode: '200',
          retmsg: 'Success',
          timestamp: new Date().toISOString(),
        },
        body: responseData,
      } as ApiResponse<T>;
    } else {
      console.error('[apiCall] API 응답 형식 오류:', responseData);
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

// FormData를 사용하는 API 호출 (React Native에서는 react-native-image-picker 등 사용)
async function apiCallFormData<T>(
  endpoint: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  const token = await AsyncStorage.getItem('accessToken');

  const headers: Record<string, string> = {};
  // FormData를 사용할 때는 Content-Type을 명시하지 않아야 합니다
  // 브라우저/React Native가 자동으로 multipart/form-data와 boundary를 설정합니다

  if (!token) {
    console.error('[apiCallFormData] 토큰이 없습니다!');
    throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
  }
  
  headers['Authorization'] = `Bearer ${token}`;
  console.log('[apiCallFormData] 토큰 존재:', token.substring(0, 20) + '...');
  console.log('[apiCallFormData] 전체 토큰 길이:', token.length);

  const url = `${API_BASE_URL}${endpoint}`;
  console.log('[apiCallFormData] ====== Multipart 요청 시작 ======');
  console.log('[apiCallFormData] API_BASE_URL:', API_BASE_URL);
  console.log('[apiCallFormData] endpoint:', endpoint);
  console.log('[apiCallFormData] 최종 요청 URL:', url);
  console.log('[apiCallFormData] 헤더:', headers);
  
  // FormData 내용 로깅 (디버깅용)
  if (__DEV__) {
    console.log('[apiCallFormData] FormData 타입:', typeof formData);
    // FormData의 내용을 직접 확인할 수는 없지만, 로깅은 가능
  }

  try {
    console.log('[apiCallFormData] 요청 전송 시작...');
    console.log('[apiCallFormData] Authorization 헤더 존재:', !!headers['Authorization']);
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers,
    });
    
    console.log('[apiCallFormData] 응답 상태:', response.status, response.statusText);
    console.log('[apiCallFormData] 응답 헤더:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorText = await response.text();
        console.error('[apiCallFormData] 에러 응답 본문:', errorText);
        if (errorText) {
          try {
            const errorJson = JSON.parse(errorText);
            console.error('[apiCallFormData] 에러 JSON:', errorJson);
            if (errorJson.head?.retmsg) {
              errorMessage = errorJson.head.retmsg;
            } else if (errorJson.message) {
              errorMessage = errorJson.message;
            } else if (errorJson.error) {
              errorMessage = errorJson.error;
            }
          } catch {
            if (errorText.length < 500) {
              errorMessage = errorText;
            }
          }
        }
      } catch (err) {
        console.error('[apiCallFormData] 에러 텍스트 파싱 실패:', err);
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
 * 내 기프티콘 목록 조회 (페이징 및 필터링)
 */
export const getMyGifticons = async (
  pageable: Pageable = { page: 0, size: 10 },
  condition?: GifticonSearchCondition
): Promise<PageGifticonListResponseDto> => {
  const params = new URLSearchParams();
  if (pageable.page !== undefined) params.append('page', pageable.page.toString());
  if (pageable.size !== undefined) params.append('size', pageable.size.toString());
  if (pageable.sort) {
    pageable.sort.forEach(sort => params.append('sort', sort));
  }

  // 필터 조건 추가
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

  console.log('[getMyGifticons] API 응답 전체:', JSON.stringify(response, null, 2));
  console.log('[getMyGifticons] response.body:', response.body);
  
  // 응답 body가 null이거나 undefined인 경우 처리
  if (!response.body) {
    console.warn('[getMyGifticons] response.body가 null입니다. 빈 페이지 응답 반환');
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: pageable.size || 10,
      number: pageable.page || 0,
      first: true,
      last: true,
      numberOfElements: 0,
      empty: true,
    };
  }

  return response.body as PageGifticonListResponseDto;
};

/**
 * 기프티콘 등록 (JSON 방식 - imageUrl 사용)
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
 * 기프티콘 등록 (Multipart 방식 - 실제 이미지 파일 전송)
 * @param gifticons 기프티콘 등록 데이터 배열
 * @param imageFile 이미지 파일 (React Native ImagePickerResponse 또는 { uri, type, name } 형식)
 */
export const registerGifticonsWithImage = async (
  gifticons: GifticonRegisterRequestDto[],
  imageFile?: { uri: string; type?: string; name?: string },
  thumbnailFile?: { uri: string; type?: string; name?: string }
): Promise<number[]> => {
  const formData = new FormData();
  
  // JSON 데이터를 문자열로 변환하여 FormData에 추가
  // 서버는 @RequestParam으로 문자열을 받거나 @RequestPart로 파일을 받을 수 있음
  const jsonString = JSON.stringify(gifticons);
  console.log('[registerGifticonsWithImage] JSON 데이터:', jsonString);
  console.log('[registerGifticonsWithImage] JSON 데이터 길이:', jsonString.length);
  console.log('[registerGifticonsWithImage] 이미지 파일:', imageFile);
  console.log('[registerGifticonsWithImage] 썸네일 파일:', thumbnailFile);
  
  // React Native FormData에서 문자열을 @RequestParam으로 보내는 방법
  // 서버는 @RequestParam(value = "requests")로 문자열을 받을 수 있음
  // React Native에서는 문자열을 직접 append하면 @RequestParam으로 전달됨
  // 하지만 Blob 형식으로 보내면 @RequestPart로 받을 수도 있음
  // 서버가 둘 다 지원하므로 문자열로 시도
  formData.append('requests', jsonString);
  
  // 참고: 웹에서는 Blob으로 보내지만, React Native에서는 문자열로 보내는 것이 더 안정적
  
  // 원본 이미지 파일이 있으면 추가
  if (imageFile) {
    // React Native FormData 형식: { uri, type, name }
    // file:// URI를 사용하는 경우 file:// 제거 필요할 수 있음
    let imageUri = imageFile.uri;
    if (imageUri.startsWith('file://')) {
      // file://는 그대로 사용 (React Native가 처리)
    }
    
    const imageFormData = {
      uri: imageUri,
      type: imageFile.type || 'image/jpeg',
      name: imageFile.name || 'image.jpg',
    };
    console.log('[registerGifticonsWithImage] 이미지 FormData:', imageFormData);
    formData.append('image', imageFormData as any);
  }
  
  // 썸네일 이미지 파일이 있으면 추가
  if (thumbnailFile) {
    let thumbnailUri = thumbnailFile.uri;
    if (thumbnailUri.startsWith('file://')) {
      // file://는 그대로 사용
    }
    
    const thumbnailFormData = {
      uri: thumbnailUri,
      type: thumbnailFile.type || 'image/jpeg',
      name: thumbnailFile.name || 'thumbnail.jpg',
    };
    console.log('[registerGifticonsWithImage] 썸네일 FormData:', thumbnailFormData);
    formData.append('thumbnail', thumbnailFormData as any);
  }
  
  console.log('[registerGifticonsWithImage] API 호출:', `${API_BASE_URL}${API_ENDPOINTS.GIFTCONS}`);
  console.log('[registerGifticonsWithImage] FormData 필드 수:', 
    (jsonString ? 1 : 0) + (imageFile ? 1 : 0) + (thumbnailFile ? 1 : 0));
  
  const response = await apiCallFormData<number[]>(
    API_ENDPOINTS.GIFTCONS,
    formData
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
  const token = await AsyncStorage.getItem('accessToken');

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
 * React Native에서는 react-native-image-picker 등을 사용하여 이미지 선택
 */
export const analyzeGifticon = async (
  images: any[] // React Native에서는 ImagePickerResponse 또는 URI 배열
): Promise<GifticonAnalysisResponseDto[]> => {
  const formData = new FormData();
  
  // React Native FormData 형식으로 변환
  images.forEach((image, index) => {
    const imageUri = image.uri || image;
    const imageType = image.type || 'image/jpeg';
    const imageName = image.fileName || `image_${index}.jpg`;
    
    formData.append('images', {
      uri: imageUri,
      type: imageType,
      name: imageName,
    } as any);
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
