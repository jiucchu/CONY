'use client';

import styled from "styled-components";
import { COLORS } from "@/constants/colors";
import MainGiftCardCarousel from "@/components/common/card/MainGiftCardCarousel";
import CouponList from "@/components/common/card/CouponList";
import { getCoupons } from "@/mockDB/mock";
import ContentLayout from "@/components/layout/ContentLayout";
import { StyledText } from "@/utils/StyledText";

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



const MainPage = () => {
  const coupons = getCoupons();
  
  const handleMoreClick = () => {
    console.log('더보기 클릭');
  };

  const mainTitle = (name: string) => {
    return (
      <TitleContainer>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <StyledText fontSize={23} fontWeight={900}  >{name}</StyledText>
          <StyledText fontSize={23} fontWeight={600} >님</StyledText>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}> 
          <StyledText fontSize={30} fontWeight={900} color={COLORS.primary} >지금 쓰기 좋은 쿠폰</StyledText>
          <StyledText fontSize={30} fontWeight={900} >이에요</StyledText>
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
    <>
      <ContentLayout>
        <MainTitleContainer>
          {mainTitle('CONY')}
        </MainTitleContainer>

        <MainGiftCardCarousel coupons={coupons} />
        {content}
      </ContentLayout>
    </>
  );
};

export default MainPage;
