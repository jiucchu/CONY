// API 규격서에 따른 응답 형식
export interface ApiResponseHead {
  retcode: string;
  retmsg: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  head: ApiResponseHead;
  body: T | null;
}

export interface ApiResponseData<T> {
  status: string;
  message: string;
  data: T;
}

export type GifticonType = 'PRODUCT' | 'PREPAID';
export type GifticonStatus = 'NOT_USED' | 'IN_USE' | 'USED';

export interface GifticonRegisterRequestDto {
  brandName: string;
  productName: string;
  categoryName?: string;
  barcodeNumber: string;
  expiryDate: string;
  originalPrice: number;
  type: GifticonType;
  imageUrl: string;
  // 자동 판매 설정
  scheduledSaleDate?: string; // ISO date string (YYYY-MM-DD)
  plannedSalePrice?: number;
}

export interface GifticonUpdateRequestDto {
  brandName: string;
  productName: string;
  categoryName?: string;
  expiryDate: string;
  originalPrice?: number;
}

export interface GifticonUseRequestDto {
  amount: number;
}

export interface GifticonLogUpdateRequestDto {
  newAmount: number;
}

export interface GifticonListResponseDto {
  gifticonId: number;
  brandName: string;
  productName: string;
  barcodeNumber: string;
  expiryDate: string;
  status: GifticonStatus;
  imageUrl: string;
  originalPrice?: number;
  currentBalance?: number;
  type?: GifticonType;
  dDay?: string;
  // 자동 판매 설정
  scheduledSaleDate?: string;
  plannedSalePrice?: number;
  autoSellDate?: string; // scheduledSaleDate의 별칭
  autoSellAmount?: number; // plannedSalePrice의 별칭
}

export interface GifticonDetailResponseDto {
  gifticonId: number;
  brandName: string;
  productName: string;
  barcodeNumber: string;
  expiryDate: string;
  status: GifticonStatus;
  imageUrl: string;
  originalPrice: number;
  currentBalance?: number; 
  categoryName?: string;
  gifticonType: GifticonType;
  histories: GifticonUsageLogResponseDto[];
  // 자동 판매 설정 (백엔드 필드명)
  scheduledSaleDate?: string;
  plannedSalePrice?: number;
  // 프론트엔드 전용 필드 (하위 호환성을 위해 유지)
  autoSellDate?: string; // scheduledSaleDate의 별칭
  autoSellAmount?: number; // plannedSalePrice의 별칭
  isUsed?: boolean;
  isExpired?: boolean;
  isDeleted?: boolean;
  isActive?: boolean;
}

export interface GifticonUsageLogResponseDto {
  logId: number;
  usedAmount: number;
  usedAt: string; 
}

export interface OcrFields {
  brandName?: string;
  productName?: string;
  originalPrice?: number;
  expiryDate?: string;
  gifticonType?: GifticonType;
  barcodeNumber?: string;
}

export interface GifticonAnalysisResponseDto {
  fields: OcrFields;
  needsReview: string[];
  imageUrl: string;
}

export interface Pageable {
  page?: number;
  size?: number;
  sort?: string[];
}

export interface PageGifticonListResponseDto {
  content: GifticonListResponseDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface GifticonSearchCondition {
  expiringSoon?: boolean;
  excludeUsed?: boolean;
  categoryId?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
}
