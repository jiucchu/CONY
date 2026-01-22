'use client';

import styled from "styled-components";
import { COLORS } from "@/constants/colors";
import MainGiftCardCarousel from "@/components/common/card/MainGiftCardCarousel";
import CouponList from "@/components/common/card/CouponList";
import { getCoupons } from "@/mockDB/mock";
import MainLayout from "@/components/layout/MainLayout";
import { StyledText } from "@/utils/StyledText";
import { useState } from "react";

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



const LandingView = styled.div<{ isAtTop: boolean }>`

  z-index: 10;
  background: ${props => props.isAtTop 
    ? `linear-gradient(to bottom, ${COLORS.primary} 0%, #f5f5f5 75%, rgba(224, 224, 224, 0) 100%)`
    : 'transparent'
  };
  transition: background 0.3s ease;
`;

const MainPage = () => {
  const coupons = getCoupons();
  const [isAtTop, setIsAtTop] = useState(true);
  
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
        coupons={coupons} 
        title="근처 사용 가능 쿠폰"
        onMoreClick={handleMoreClick}
      />
      
      <CouponList 
        coupons={coupons} 
        title="유효기간 임박 쿠폰"
        onMoreClick={handleMoreClick}
      />
    </ContentArea>
  );

  return (
      <MainLayout onScroll={handleScroll} isAtTop={isAtTop}>
        <LandingView isAtTop={isAtTop}>
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
