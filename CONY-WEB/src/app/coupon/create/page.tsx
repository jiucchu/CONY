import CouponCreate from "@/page/manage/crud/CouponCreate";
import { GifticonDetailResponseDto } from "@/types/gifticon/gifticon";

export default function CouponCreatePage() {
  // CouponCreate는 분석된 쿠폰 목록을 받는데, 이는 이미지 분석 후 전달되는 데이터입니다.
  // 빈 배열로 시작하여 분석된 쿠폰이 있으면 전달됩니다.
  const couponList: GifticonDetailResponseDto[] = [];
  
  return <CouponCreate couponList={couponList} />;
}
