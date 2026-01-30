'use client';

import CouponDetail from "@/page/manage/crud/CouponDetail";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// 동적 렌더링 강제 (빌드 시 prerendering 방지)
export const dynamic = 'force-dynamic';

function CouponDetailContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get('id');
  const couponId = idParam ? parseInt(idParam, 10) : 0;
  
  return <CouponDetail id={couponId} />;
}

export default function CouponDetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CouponDetailContent />
    </Suspense>
  );
}
