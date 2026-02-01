export type TransactionType = 'CHARGE' | 'PURCHASE' | 'SALE' | 'REFUND';

export interface TransactionResponse {
  transactionId: number;
  type: TransactionType;
  amount: number;
  balance: number;
  description: string;
  createdAt: string;
  relatedId?: number;
}

export interface PageTransactionResponse {
  content: TransactionResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}
