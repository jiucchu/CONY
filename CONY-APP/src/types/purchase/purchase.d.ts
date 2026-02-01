export interface PurchaseResponseDto {
  purchaseId: number;
  saleId: number;
  gifticonId: number;
  brandName: string;
  productName: string;
  purchasePrice: number;
  imageUrl: string;
  purchasedAt: string;
  status: string;
}

export interface PagePurchaseResponseDto {
  content: PurchaseResponseDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}
