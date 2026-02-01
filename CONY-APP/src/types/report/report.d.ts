export interface ReportRequestDto {
  saleId: number;
  reason: string;
  description?: string;
}

export interface ReportResponse {
  reportId: number;
  saleId: number;
  reason: string;
  description?: string;
  status: string;
  createdAt: string;
}
