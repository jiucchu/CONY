'use client';

import PaymentDetail from "@/page/payment/detail/Detail";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { getCoupons } from "@/mockDB/mock";
import { useEffect, useState } from "react";
import { GifticonDetailResponseDto } from "@/types/gifticon/gifticon";

function PaymentDetailContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get('id');
  const couponId = idParam ? parseInt(idParam, 10) : 0;
  const [coupon, setCoupon] = useState<GifticonDetailResponseDto | null>(null);

  useEffect(() => {
    const coupons = getCoupons();
    const foundCoupon = coupons.find(c => c.gifticonId === couponId);
    setCoupon(foundCoupon || null);
  }, [couponId]);

  if (!coupon) {
    return (
      <div>
        <h1>쿠폰을 찾을 수 없습니다.</h1>
      </div>
    );
  }

  return <PaymentDetail coupon={coupon} />;
}

const PaymentDetailPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentDetailContent />
    </Suspense>
  );
};

export default PaymentDetailPage;