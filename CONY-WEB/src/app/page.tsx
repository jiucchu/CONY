import MainGiftCard from "@/components/common/card/atomic/MainGiftCard";
import { getCoupons } from "@/mockDB/mock";
import LoginPage from "@/page/auth/LoginPage";
import CouponList from "@/components/common/card/CouponList";
import MainPage from "@/page/main/MainPage";
export default function Home() {
  return (
    <>
    {/* <CouponList coupons={getCoupons()} title="유효기간 임박 쿠폰"  /> */}
    <MainPage />
    </>
  );
}
