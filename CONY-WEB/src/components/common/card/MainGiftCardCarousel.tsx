'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import styled from 'styled-components';
import { COLORS } from '@/constants/colors';
import MainGiftCard from './atomic/MainGiftCard';
import { GifticonDetailResponseDto, GifticonListResponseDto } from '@/types/gifticon/gifticon';
import { useRouter } from 'next/navigation';
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
  coupons: (GifticonDetailResponseDto | GifticonListResponseDto)[];
}

const MainGiftCardCarousel = ({ coupons }: MainGiftCardCarouselProps) => {
  const router = useRouter();

  const handleCardClick = (couponId: number) => {
    router.push(`/coupon/detail?id=${couponId}`);
  };

  return (
    <CarouselContainer>
      <StyledSwiper
        modules={[Pagination]}
        slidesPerView={1.5}
        centeredSlides={true}
        loop={false}
        spaceBetween={20}  
        pagination={{
          clickable: true,
        }}
        breakpoints={{
          640: {
            slidesPerView: 1.5,
            spaceBetween: 30,
          },
          768: {
            slidesPerView: 1.75,
            spaceBetween: 30,
          },
        }}
      >
        {coupons.map((coupon) => (
          <SwiperSlide 
            key={coupon.gifticonId}
            onClick={() => handleCardClick(coupon.gifticonId)}
            style={{ cursor: 'pointer' }}
          >
            <MainGiftCard coupon={coupon} />
          </SwiperSlide>
        ))}
      </StyledSwiper>
    </CarouselContainer>
  );
};

export default MainGiftCardCarousel;
