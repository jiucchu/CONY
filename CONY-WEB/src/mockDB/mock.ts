import { Coupon } from "@/types/coupon/coupon";
import { UserInfo } from "@/types/user/user";

const mockCoupons: Coupon[] = [
  {
    coupon_id: 1,
    title: "쿠폰 제목 1",
    brand: "브랜드 1",
    price: 10000,
    auto_sell_date: "2026-01-16",
    auto_sell_amount: 10000,
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
    auto_sell_date: "2026-01-16",
    auto_sell_amount: 10000,
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
    auto_sell_date: "2026-01-16",
    auto_sell_amount: 10000,
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
    auto_sell_date: "2026-01-16",
    auto_sell_amount: 10000,
    image_url: "https://via.placeholder.com/150",
    expiration_date: "2026-01-16",
    is_used: false,
    is_expired: false,
    is_deleted: false,
    is_active: true,
  },
];

const mockUserInfo: UserInfo = {
  user_id: 1,
  name: "김코니",
  email: "conykim@gmail.com",
  balance: 3600,
  avatar_url: undefined,
};

export const getCoupons = () => {
  return mockCoupons;
};

export const getUserInfo = () => {
  return mockUserInfo;
};