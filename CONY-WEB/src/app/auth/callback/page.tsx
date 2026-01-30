'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setTokens } from '@/api/auth';

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken) {
      setTokens(accessToken, refreshToken || undefined);
      router.replace('/');
    } else {
      // 토큰이 없으면 로그인 페이지로
      router.replace('/auth/login');
    }
  }, [searchParams, router]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'Pretendard, sans-serif'
    }}>
      <p>로그인 처리 중...</p>
    </div>
  );
}

export default function OAuthCallback() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Pretendard, sans-serif'
      }}>
        <p>로딩 중...</p>
      </div>
    }>
      <OAuthCallbackContent />
    </Suspense>
  );
}
