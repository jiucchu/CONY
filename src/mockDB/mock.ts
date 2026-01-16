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
  {
    coupon_id: 2,
    title: "쿠폰 제목 2",
    brand: "브랜드 2",
    price: 20000,
    image_url: "https://via.placeholder.com/150",
    expiration_date: "2026-01-16",
    is_used: false,
    is_expired: false,
    is_deleted: false,
    is_active: true,
  },
  {
    coupon_id: 3,
    title: "쿠폰 제목 3",
    brand: "브랜드 3",
    price: 30000,
    image_url: "https://via.placeholder.com/150",
    expiration_date: "2026-01-16",
    is_used: false,
    is_expired: false,
    is_deleted: false,
    is_active: true,
  },
  {
    coupon_id: 4,
    title: "쿠폰 제목 4",
    brand: "브랜드 4",
    price: 40000,
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