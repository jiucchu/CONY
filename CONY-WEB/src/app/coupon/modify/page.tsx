'use client';

import CouponModify from "@/page/manage/crud/CouponModify";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

function CouponModifyContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get('id');
  const couponId = idParam ? parseInt(idParam, 10) : 0;
  
  return <CouponModify id={couponId} />;
}

export default function CouponModifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CouponModifyContent />
    </Suspense>
  );
}
