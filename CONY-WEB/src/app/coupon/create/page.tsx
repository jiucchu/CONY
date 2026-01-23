import CouponCreate from "@/page/crud/CouponCreate";
import { getCoupons } from "@/mockDB/mock";

export default function CouponCreatePage() {
  const couponList = getCoupons();
  
  return <CouponCreate couponList={couponList} />;
}
