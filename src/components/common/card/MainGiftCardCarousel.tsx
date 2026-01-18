'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import styled from 'styled-components';
import { COLORS } from '@/constants/colors';
import MainGiftCard from './atomic/MainGiftCard';
import { Coupon } from '@/types/coupon/coupon';
import 'swiper/css';
import 'swiper/css/pagination';

const CarouselContainer = styled.div`
  width: 100%;
  padding-bottom: 32px;
  min-height: 450px;
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
    bottom: 0 !important;
    position: relative;
    margin-top: 40px;
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

interface MainGiftCardCarouselProps {
  coupons: Coupon[];
}

const MainGiftCardCarousel = ({ coupons }: MainGiftCardCarouselProps) => {
  return (
    <CarouselContainer>
      <StyledSwiper
        modules={[Pagination]}
        slidesPerView={1.5}
        centeredSlides={true}
        loop={false}
        spaceBetween={0}
        pagination={{
          clickable: true,
        }}
        breakpoints={{
          640: {
            slidesPerView: 1.3,
            spaceBetween: 12,
          },
          768: {
            slidesPerView: 1.5,
            spaceBetween: 16,
          },
        }}
      >
        {coupons.map((coupon) => (
          <SwiperSlide key={coupon.coupon_id}>
            <MainGiftCard coupon={coupon} />
          </SwiperSlide>
        ))}
      </StyledSwiper>
    </CarouselContainer>
  );
};

export default MainGiftCardCarousel;
