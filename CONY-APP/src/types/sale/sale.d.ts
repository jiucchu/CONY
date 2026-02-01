export type SaleCategory = 'FOOD' | 'CAFE' | 'RETAIL' | 'ENTERTAINMENT' | 'ETC';
export type SaleSort = 'LATEST' | 'PRICE_LOW' | 'PRICE_HIGH' | 'EXPIRY_SOON';
export type SaleStatus = 'ON_SALE' | 'SOLD_OUT' | 'CANCELLED';

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
  salePrice: number;
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
  totalSales: number;
  onSaleCount: number;
  soldOutCount: number;
  totalRevenue: number;
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
