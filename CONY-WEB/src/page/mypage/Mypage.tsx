'use client';

import MyInfoCard from '@/components/mypage/MyInfoCard';
import styled from 'styled-components'; 
import ContentLayout from '@/components/layout/ContentLayout';
import ConnectAccount from '@/components/mypage/ConnectAccount';
import CouponStatTable from '@/components/mypage/CouponStatTable';
import WithdrawButton from '@/components/mypage/WithdrawButton';
import LogoutButton from '@/components/mypage/LogoutButton';
import CouponList from '@/components/common/card/CouponList';
import { COLORS } from '@/constants/colors';
import { getMyGifticons } from '@/api/gifticon/gifticonApi';
import { useEffect, useState } from 'react';
import { GifticonListResponseDto } from '@/types/gifticon/gifticon';
import { useRouter } from 'next/navigation';
import { logout } from '@/api/auth';

const MypageContainer = styled.div`
  padding: 5% 0;
  display: flex;
  flex-direction: column;
  gap: 40px;
  justify-content: center;
  align-items: center;
  margin: 2% 0 10% 0;
`;

const Mypage = () => {
  const router = useRouter();
  const [sellingCoupons, setSellingCoupons] = useState<GifticonListResponseDto[]>([]);

  useEffect(() => {
    const fetchSellingCoupons = async () => {
      try {
        const response = await getMyGifticons({ page: 0, size: 20 });
        // TODO: 판매 중인 기프티콘만 필터링 (status나 다른 필드로 판단)
        setSellingCoupons(response.content);
      } catch (err) {
        console.error('판매 중인 기프티콘 조회 실패:', err);
      }
    };
    fetchSellingCoupons();
  }, []);

  const handleLogout = () => {
    if (!window.confirm('정말 로그아웃하시겠습니까?')) {
      return;
    }

    logout();
    router.replace('/auth/login');
  };

  return (
    <ContentLayout>
      <MypageContainer>
        <MyInfoCard />
        <CouponStatTable myCouponCount={0} sharedCouponCount={0} soldCouponCount={0} />
        <div style={{ width: '100%', borderBottom: `1px solid ${COLORS.background.lightGray}` }}>
          <CouponList coupons={sellingCoupons} title="판매 중인 기프티콘" />
        </div>
        <ConnectAccount />
        <LogoutButton onClick={handleLogout} />
        <WithdrawButton />
      </MypageContainer>
    </ContentLayout>
  );
};

export default Mypage;