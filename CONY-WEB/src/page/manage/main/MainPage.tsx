'use client';

import styled from "styled-components";
import { COLORS } from "@/constants/colors";
import MainGiftCardCarousel from "@/components/common/card/MainGiftCardCarousel";
import CouponList from "@/components/common/card/CouponList";
import MainLayout from "@/components/layout/MainLayout";
import { StyledText } from "@/utils/StyledText";
import { useState, useEffect } from "react";
import { getMyGifticons } from "@/api/gifticon/gifticonApi";
import { GifticonListResponseDto } from "@/types/gifticon/gifticon";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/api/auth";

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const MainTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: end;
  padding: 10% 0 15px 10%;
  overflow: hidden;
`;

const TitleContainer = styled.div`
  z-index: 1;
  display: flex;
  flex-direction: column;
`;



const LandingView = styled.div<{ $isAtTop: boolean }>`

  z-index: 10;
  background: ${props => props.$isAtTop 
    ? `linear-gradient(to bottom, ${COLORS.primary} 0%, #f5f5f5 75%, rgba(224, 224, 224, 0) 100%)`
    : 'transparent'
  };
  transition: background 0.3s ease;
`;

const MainPage = () => {
  const router = useRouter();
  const [coupons, setCoupons] = useState<GifticonListResponseDto[]>([]);
  const [nearbyCoupons, setNearbyCoupons] = useState<GifticonListResponseDto[]>([]);
  const [expiringCoupons, setExpiringCoupons] = useState<GifticonListResponseDto[]>([]);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  // 로그인 체크
  useEffect(() => {
    // 클라이언트 사이드에서만 체크
    if (typeof window === 'undefined') {
      setIsChecking(false);
      return;
    }

    const authenticated = isAuthenticated();
    
    if (!authenticated) {
      // 로그인 안 되어 있으면 로그인 페이지로 리다이렉트
      router.replace("/auth/login");
      return;
    }
    
    // 로그인 되어 있으면 체크 완료
    setIsChecking(false);
  }, [router]);

  useEffect(() => {
    if (!isChecking) {
      const fetchCoupons = async () => {
        try {
          // 전체 쿠폰 목록 (캐러셀용)
          const response = await getMyGifticons({ page: 0, size: 20 }, { excludeUsed: true });
          setCoupons(response.content);

          // 위치 정보 가져오기
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                  // 근처 사용 가능 쿠폰
                  const nearbyResponse = await getMyGifticons(
                    { page: 0, size: 10 },
                    {
                      latitude,
                      longitude,
                      radius: 1000, // 1km 반경
                      excludeUsed: true,
                    }
                  );
                  setNearbyCoupons(nearbyResponse.content);
                } catch (err) {
                  console.error('근처 쿠폰 조회 실패:', err);
                }
              },
              (error) => {
                console.warn('위치 정보를 가져올 수 없습니다:', error);
                // 위치 정보가 없어도 유효기간 임박 쿠폰은 조회 가능
              }
            );
          }

          // 유효기간 임박 쿠폰 (1달 이내)
          const expiringResponse = await getMyGifticons(
            { page: 0, size: 10, sort: ['expiryDate,asc'] },
            {
              expiringSoon: true,
              excludeUsed: true,
            }
          );
          setExpiringCoupons(expiringResponse.content);
        } catch (err) {
          console.error('기프티콘 목록 조회 실패:', err);
        }
      };
      fetchCoupons();
    }
  }, [isChecking]);
  
  const handleScroll = (scrollTop: number) => {
    setIsAtTop(scrollTop === 0);
  };
  
  const handleMoreClick = () => {
    console.log('더보기 클릭');
  };

  const mainTitle = (name: string) => {
    return (
      <TitleContainer>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <StyledText fontSize={23} fontWeight={900} color={isAtTop ? COLORS.white : COLORS.text.primary}>{name}</StyledText>
          <StyledText fontSize={23} fontWeight={600} color={isAtTop ? COLORS.white : COLORS.text.primary}>님</StyledText>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}> 
          <StyledText fontSize={30} fontWeight={900} color={isAtTop ? COLORS.white : COLORS.primary}>지금 쓰기 좋은 쿠폰</StyledText>
          <StyledText fontSize={30} fontWeight={600} color={isAtTop ? COLORS.white : COLORS.text.primary}>이에요</StyledText>
        </div>
      </TitleContainer>
    );
  };

  const content = (
    <ContentArea>
      <CouponList 
        coupons={nearbyCoupons.length > 0 ? nearbyCoupons : coupons} 
        title="근처 사용 가능 쿠폰"
        onMoreClick={handleMoreClick}
      />
      
      <CouponList 
        coupons={expiringCoupons.length > 0 ? expiringCoupons : coupons} 
        title="유효기간 임박 쿠폰"
        onMoreClick={handleMoreClick}
      />
    </ContentArea>
  );

  if (isChecking) {
    return (
      <MainLayout onScroll={handleScroll} isAtTop={isAtTop}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <StyledText fontSize={16} fontWeight={600} color={COLORS.text.secondary}>
            확인 중...
          </StyledText>
        </div>
      </MainLayout>
    );
  }

  return (
      <MainLayout onScroll={handleScroll} isAtTop={isAtTop}>
        <LandingView $isAtTop={isAtTop}>
          <MainTitleContainer>
            {mainTitle('CONY')}
          </MainTitleContainer>
          <MainGiftCardCarousel coupons={coupons} />
        </LandingView>
        {content}
      </MainLayout>
  );
};

export default MainPage;
