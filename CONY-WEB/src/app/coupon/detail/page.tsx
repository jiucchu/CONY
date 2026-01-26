'use client';

import CouponDetail from "@/page/manage/crud/CouponDetail";
import { useSearchParams } from "next/navigation";

export default function CouponDetailPage() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get('id');
  const couponId = idParam ? parseInt(idParam, 10) : 0;
  
  return <CouponDetail id={couponId} />;
}
