'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AlertList from '@/components/mypage/AlertList';
import { getCoupons, getUserInfo } from '@/mockDB/mock';

const AlertPage = () => {
  const router = useRouter();
  const coupons = getCoupons();
  const userInfo = getUserInfo();

  const alertData = coupons.map((coupon, index) => ({
    id: coupon.gifticonId,
    type: index % 2 === 0 ? ('EXPIRATION' as const) : ('LOCATION' as const),
    brandName: coupon.brandName,
    productName: coupon.productName,
    imageUrl: coupon.imageUrl,
    userName: userInfo.name,
    remainingDays: 3,
    distance: 87,
  }));

  return (
    <div className="min-h-screen bg-white">
      <header className="relative flex items-center justify-center p-4 bg-white border-b border-gray-50">
        <button 
          onClick={() => router.push('/')} 
          className="absolute left-4 p-1 hover:bg-gray-100 rounded-full"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <h1 className="text-lg font-bold">알림</h1>
      </header>

      <main>
        <AlertList alerts={alertData} />
      </main>
    </div>
  );
};

export default AlertPage;