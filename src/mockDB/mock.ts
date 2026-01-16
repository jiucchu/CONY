import { Coupon } from "@/types/coupon/coupon";

const mockCoupons: Coupon[] = [
  {
    coupon_id: 1,
    title: "쿠폰 제목 1",
    brand: "브랜드 1",
    price: 10000,
    image_url: "https://via.placeholder.com/150",
    expiration_date: "2026-01-16",
    is_used: false,
    is_expired: false,
    is_deleted: false,
    is_active: true,
  },
];

export const getCoupons = () => {
  return mockCoupons;
};