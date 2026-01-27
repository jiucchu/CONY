'use client';

import styled from "styled-components";
import InfoModifyCard from "@/components/InfoModify/InfoModifyCard";
import { GifticonDetailResponseDto } from "@/types/gifticon/gifticon";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { COLORS } from '@/constants/colors';
import { DefaultButton } from "@/components/common/atomic/Button";
import ContentLayout from "@/components/layout/ContentLayout";
import { goBackWithAlert } from "@/utils/utils";

import 'swiper/css';
import 'swiper/css/pagination';

const CouponCreateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding-bottom: 32px;
  padding-top: 20px;
  min-height: 450px;
  position: relative;
`;

const StyledSwiper = styled(Swiper)`
  width: 100%;
  padding: 30px 0;
  
  .swiper-slide {
    display: flex;
    justify-content: center;
    align-items: center;
    height: auto;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    transform: scale(0.95);
  }
  
  .swiper-slide-active {
    transform: scale(1.05);
    z-index: 1;
  }
  
  .swiper-pagination {
    top: 0 !important;
    bottom: auto !important;
    position: absolute;
    margin-top: 0;
    margin-bottom: 10px;
  }
  
  .swiper-pagination-bullet {
    width: 8px;
    height: 8px;
    background-color: ${COLORS.text.secondary};
    opacity: 1;
    margin: 0 4px;
    transition: background-color 0.3s ease;
  }
  
  .swiper-pagination-bullet-active {
    background-color: ${COLORS.primary};
  }
`;

interface CouponCreateProps {
  couponList: GifticonDetailResponseDto[];
}

const CouponCreate = ({ couponList }: CouponCreateProps) => {
  return (
    <ContentLayout headerType="back" headerTitle="쿠폰 등록" onBack={goBackWithAlert}>
    <CouponCreateContainer>
      <StyledSwiper
        modules={[Pagination]}
        slidesPerView={1.1}
        centeredSlides={true}
        loop={false}
        spaceBetween={30}
        pagination={{
          clickable: true,
        }}
        breakpoints={{
          640: {
            slidesPerView: 1.0,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 1.1,
            spaceBetween: 30,
          },
        }}
      >
        {couponList.map((coupon) => (
          <SwiperSlide key={coupon.gifticonId}>
            <div style={{ marginTop: '20px', width: '100%' }}>   
              <InfoModifyCard
                imageUrl={coupon.imageUrl}
                giftCardName={coupon.productName}
                store={coupon.brandName}
                price={coupon.originalPrice}
                expirationDate={coupon.expiryDate}
              />
            </div>
          </SwiperSlide>
        ))}
      </StyledSwiper>
      <div style={{ width: '60%', margin: '20px auto' }}>
        <DefaultButton children="쿠폰 등록" onClick={() => {}} />    
      </div>
    </CouponCreateContainer>
    </ContentLayout>
  );
};

export default CouponCreate;
