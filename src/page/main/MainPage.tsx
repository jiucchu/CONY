'use client';

import styled from "styled-components";
import { COLORS } from "@/constants/colors";
import MainGiftCardCarousel from "@/components/common/card/MainGiftCardCarousel";
import CouponList from "@/components/common/card/CouponList";
import { getCoupons } from "@/mockDB/mock";
import ContentLayout from "@/app/ContentLayout";

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;


const MainPage = () => {
  const coupons = getCoupons();
  
  const handleMoreClick = () => {
    console.log('더보기 클릭');
  };


  const content = (
    <ContentArea>
      <MainGiftCardCarousel coupons={coupons} />
      <CouponList 
        coupons={coupons} 
        title="유효기간 임박 쿠폰"
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
    <ContentLayout>
      {content}
    </ContentLayout>
  );
};

export default MainPage;
