'use client';

import React, { useSyncExternalStore, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface AlertItemProps {
  id: number;
  type: 'EXPIRATION' | 'LOCATION';
  brandName: string;
  productName: string;
  imageUrl: string;
  userName: string;
  remainingDays?: number; // 7, 3, 0(당일) 등
  distance?: number; // 반경 (000)m
  gifticonCount?: number; // 인근 매장 기프티콘 개수 (n개)
}

const AlertItem = ({ 
  id,
  type, 
  brandName, 
  productName, 
  imageUrl, 
  userName,
  remainingDays, 
  distance,
  gifticonCount = 1 // 기본값 1개
}: AlertItemProps) => {
  const router = useRouter();
  const isExpiration = type === 'EXPIRATION';

  const isRead = useSyncExternalStore(
    useCallback((onStoreChange: () => void) => {
      window.addEventListener('storage', onStoreChange);
      window.addEventListener('pageshow', onStoreChange);
      window.addEventListener('focus', onStoreChange);
      return () => {
        window.removeEventListener('storage', onStoreChange);
        window.removeEventListener('pageshow', onStoreChange);
        window.removeEventListener('focus', onStoreChange);
      };
    }, []),
    () => localStorage.getItem(`alert_read_${id}`) === 'true',
    () => true
  );

  const backgroundColor = useMemo(() => {
    if (typeof window === 'undefined') return 'bg-white';
    return isRead ? 'bg-white' : 'bg-[#FFF5F7]';
  }, [isRead]);

  const title = isExpiration ? '유효기간이 임박했어요' : '사용 가능한 기프티콘이 있어요';
  
  const content = isExpiration 
    ? (remainingDays === 0 
        ? `오늘 만료되는 "${brandName}" [${productName}] 기프티콘이 있어요!` 
        : `유효기간이 ${remainingDays}일 남은 "${brandName}" [${productName}] 기프티콘이 있어요!`)
    : `${distance}m 안에서 "${brandName}"를 포함한 ${gifticonCount}개의 기프티콘을 사용 가능합니다.`;

  const handleItemClick = () => {
    localStorage.setItem(`alert_read_${id}`, 'true');
    router.push(`/gifticon/${id}`);
  };

  return (
    <div 
      onClick={handleItemClick}
      className={`flex items-start p-4 border-b border-gray-50 cursor-pointer transition-colors duration-200 ${backgroundColor}`}
    >
      <div className="relative flex-shrink-0">
        <div className="relative w-14 h-14 bg-gray-200 rounded-full overflow-hidden">
          {imageUrl && !imageUrl.includes('placeholder') ? (
            <Image src={imageUrl} alt={productName} fill sizes="56px" className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
        </div>
        <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-white rounded-full shadow-sm border border-gray-100 z-10 flex items-center justify-center text-[10px]">
          {isExpiration ? '⏰' : '📍'}
        </div>
      </div>

      <div className="ml-4 flex-1">
        <p className="text-xs font-bold text-gray-500 mb-0.5">{title}</p>
        <p className="text-[14px] font-medium text-gray-800 leading-tight">
          {content}
        </p>
      </div>
    </div>
  );
};

export default AlertItem;