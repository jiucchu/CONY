export type SaleCategory = 'FOOD' | 'CAFE' | 'RETAIL' | 'ENTERTAINMENT' | 'ETC';
export type SaleSort = 'LATEST' | 'PRICE_LOW' | 'PRICE_HIGH' | 'EXPIRY_SOON';
export type SaleStatus = 'PENDING' | 'ON_SALE' | 'SOLD_OUT' | 'CANCELLED';

export interface SaleListResponseDto {
  saleId: number;
  gifticonId: number;
  brandName: string;
  productName: string;
  salePrice: number;
  originalPrice: number;
  expiryDate: string;
  imageUrl: string;
  category: SaleCategory;
  status: SaleStatus;
  createdAt: string;
  distance?: number;
}

export interface SaleRequestDto {
  gifticonId: number;
  originalPrice: number;
  salePrice: number;
  scheduledSaleDate?: string; // ISO date string (YYYY-MM-DD)
}

export interface SaleUpdateRequestDto {
  salePrice: number;
}

export interface SaleSearchCondition {
  keyword?: string;
  category?: SaleCategory;
  brand?: string;
  sort?: SaleSort;
  latitude?: number;
  longitude?: number;
}

export interface SaleStatsDto {
  pendingCount: number; // 판매 대기 개수
  onSaleCount: number; // 판매 중 개수
  soldOutCount: number; // 판매 완료 개수
  totalCount?: number; // 전체 개수 (pendingCount + onSaleCount + soldOutCount)
}

export interface PageSaleListResponseDto {
  content: SaleListResponseDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}
