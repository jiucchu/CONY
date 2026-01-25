export interface Coupon {
  coupon_id: number;
  title: string;
  brand: string;
  price: number;
  auto_sell_date: string;
  auto_sell_amount: number;
  image_url: string;
  expiration_date: string;
  is_used: boolean;
  is_expired: boolean;
  is_deleted: boolean;
  is_active: boolean;
}

export interface FolderData {
  id: string;
  title: string;
  type: 'selected' | 'unselected';
}
