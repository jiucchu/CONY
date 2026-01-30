'use client';

import PaymentDetail from "@/page/payment/detail/Detail";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { GifticonDetailResponseDto } from "@/types/gifticon/gifticon";
import { getGifticonDetail } from "@/api/gifticon/gifticonApi";

function PaymentDetailContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get('id');
  const couponId = idParam ? parseInt(idParam, 10) : 0;
  const [coupon, setCoupon] = useState<GifticonDetailResponseDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoupon = async () => {
      if (!couponId) return;
      try {
        setLoading(true);
        const data = await getGifticonDetail(couponId);
        setCoupon(data);
      } catch (err) {
        console.error('기프티콘 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupon();
  }, [couponId]);

  if (loading) {
    return <div>로딩 중...</div>;
  }

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