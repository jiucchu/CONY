import { GifticonDetailResponseDto } from "@/types/gifticon/gifticon";
import { UserInfo } from "@/types/user/user";
import { GifticonUsageLogResponseDto } from "@/types/gifticon/gifticon";

const mockCoupons: GifticonDetailResponseDto[] = [
  {
    gifticonId: 1,
    productName: "쿠폰 제목 1",
    brandName: "브랜드 1",
    originalPrice: 10000,
    autoSellDate: "2026-01-16",
    autoSellAmount: 10000,
    imageUrl: "https://via.placeholder.com/150",
    expiryDate: "2026-01-16",
    barcodeNumber: "1234567890123456",
    status: 'NOT_USED',
    gifticonType: 'PRODUCT',
    histories: [],
    isUsed: false,
    isExpired: false,
    isDeleted: false,
    isActive: true,
  },
  {
    gifticonId: 2,
    productName: "쿠폰 제목 2",
    brandName: "브랜드 2",
    originalPrice: 20000,
    autoSellDate: "2026-01-16",
    autoSellAmount: 10000,
    imageUrl: "https://via.placeholder.com/150",
    expiryDate: "2026-01-16",
    barcodeNumber: "1234567890123457",
    status: 'NOT_USED',
    gifticonType: 'PREPAID',
    currentBalance: 11000,
    histories: [
      {
        logId: 1,
        usedAmount: 3000,
        usedAt: '2025-01-01T14:01:00',
      },
      {
        logId: 2,
        usedAmount: 3000,
        usedAt: '2025-01-01T14:01:00',
      },
      {
        logId: 3,
        usedAmount: 3000,
        usedAt: '2025-01-01T14:01:00',
      },
    ],
    isUsed: false,
    isExpired: false,
    isDeleted: false,
    isActive: true,
  },
  {
    gifticonId: 3,
    productName: "쿠폰 제목 3",
    brandName: "브랜드 3",
    originalPrice: 30000,
    autoSellDate: "2026-01-16",
    autoSellAmount: 10000,
    imageUrl: "https://via.placeholder.com/150",
    expiryDate: "2026-01-16",
    barcodeNumber: "1234567890123458",
    status: 'NOT_USED',
    gifticonType: 'PRODUCT',
    histories: [],
    isUsed: false,
    isExpired: false,
    isDeleted: false,
    isActive: true,
  },
  {
    gifticonId: 4,
    productName: "쿠폰 제목 4",
    brandName: "브랜드 4",
    originalPrice: 40000,
    autoSellDate: "2026-01-16",
    autoSellAmount: 10000,
    imageUrl: "https://via.placeholder.com/150",
    expiryDate: "2026-01-16",
    barcodeNumber: "1234567890123459",
    status: 'NOT_USED',
    gifticonType: 'PREPAID',
    currentBalance: 15000,
    histories: [],
    isUsed: false,
    isExpired: false,
    isDeleted: false,
    isActive: true,
  },
];

const mockUserInfo: UserInfo = {
  user_id: 1,
  name: "김코니",
  email: "conykim@gmail.com",
  balance: 3600,
  avatar_url: undefined,
};

const mockBrands = [
  "브랜드 1",
  "브랜드 2",
  "브랜드 3",
  "브랜드 4",
];

export const getCoupons = () => {
  return mockCoupons;
};

export const getUserInfo = () => {
  return mockUserInfo;
};

export const getBrands = () => {
  return mockBrands;
};