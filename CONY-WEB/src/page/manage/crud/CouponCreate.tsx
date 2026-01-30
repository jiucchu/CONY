'use client';

import styled from "styled-components";
import InfoModifyCard from "@/components/InfoModify/InfoModifyCard";
import { GifticonDetailResponseDto, GifticonRegisterRequestDto, GifticonType } from "@/types/gifticon/gifticon";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { COLORS } from '@/constants/colors';
import { DefaultButton } from "@/components/common/atomic/Button";
import ContentLayout from "@/components/layout/ContentLayout";
import { goBackWithAlert, goBack } from "@/utils/utils";
import { useState, useRef, useEffect } from "react";
import { registerGifticons } from "@/api/gifticon/gifticonApi";
import { useRouter } from "next/navigation";
import { StyledText } from "@/utils/StyledText";

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

const AddButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-bottom: 16px;
`;

const AddButton = styled.button`
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

`;

const CardWrapper = styled.div`
  position: relative;
  width: 100%;
  margin-top: 20px;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 10px;
  right: 8%;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${COLORS.background.lightGray};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: ${COLORS.text.secondary};
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 16px;
    height: 16px;
    stroke: ${COLORS.text.primary};
    fill: none;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 60%;
  margin: 20px auto;
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

interface CouponFormData {
  id: string;
  imageUrl: string;
  giftCardName: string;
  barcode: string;
  store: string;
  type: 'product' | 'amount';
  price: number;
  expirationDate: string;
}

const CouponCreate = ({ couponList }: CouponCreateProps) => {
  const router = useRouter();
  const swiperRef = useRef<any>(null);
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const [coupons, setCoupons] = useState<CouponFormData[]>(() => {
    // 초기 데이터가 있으면 변환, 없으면 빈 카드 하나
    if (couponList && couponList.length > 0) {
      return couponList.map((coupon, index) => ({
        id: `coupon-${index}`,
        imageUrl: coupon.imageUrl || '',
        giftCardName: coupon.productName || '',
        barcode: '',
        store: coupon.brandName || '',
        type: coupon.gifticonType === 'PREPAID' ? 'amount' : 'product',
        price: coupon.originalPrice || 0,
        expirationDate: coupon.expiryDate || '',
      }));
    }
    return [{
      id: 'coupon-0',
      imageUrl: '',
      giftCardName: '',
      barcode: '',
      store: '',
      type: 'product' as const,
      price: 0,
      expirationDate: '',
    }];
  });

  const handleAddCoupon = () => {
    const newCoupon: CouponFormData = {
      id: `coupon-${Date.now()}`,
      imageUrl: '',
      giftCardName: '',
      barcode: '',
      store: '',
      type: 'product',
      price: 0,
      expirationDate: '',
    };
    const newCoupons = [...coupons, newCoupon];
    const newIndex = newCoupons.length - 1;
    setCoupons(newCoupons);
    // 새로 추가된 카드로 이동
    setTimeout(() => {
      const swiper = swiperInstance || swiperRef.current?.swiper || swiperRef.current;
      if (swiper && swiper.slideTo) {
        swiper.slideTo(newIndex, 300);
      }
    }, 300);
  };

  const handleDeleteCoupon = (id: string) => {
    if (coupons.length <= 1) {
      alert('최소 하나의 쿠폰 카드는 필요합니다.');
      return;
    }
    
    if (confirm('이 쿠폰 카드를 삭제하시겠습니까?')) {
      const newCoupons = coupons.filter(coupon => coupon.id !== id);
      setCoupons(newCoupons);
      // 삭제 후 첫 번째 카드로 이동
      setTimeout(() => {
        if (swiperRef.current) {
          swiperRef.current.slideTo(0);
        }
      }, 100);
    }
  };

  const updateCoupon = (id: string, field: keyof CouponFormData, value: any) => {
    setCoupons(coupons.map(coupon => 
      coupon.id === id ? { ...coupon, [field]: value } : coupon
    ));
  };

  const handleRegister = async () => {
    // 필수 필드 검증
    const invalidCoupons = coupons.filter(coupon => 
      !coupon.giftCardName || !coupon.barcode || !coupon.store || !coupon.expirationDate || coupon.price <= 0
    );

    if (invalidCoupons.length > 0) {
      alert('모든 필수 항목을 입력해주세요. (가격은 0보다 커야 합니다)');
      return;
    }

    // 날짜 검증 (과거 날짜 체크)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const invalidDateCoupons = coupons.filter(coupon => {
      if (!coupon.expirationDate) return true;
      let dateStr = coupon.expirationDate;
      if (dateStr.includes('/')) {
        dateStr = dateStr.replace(/\//g, '-');
      }
      const expiryDate = new Date(dateStr);
      expiryDate.setHours(0, 0, 0, 0);
      return expiryDate < today;
    });

    if (invalidDateCoupons.length > 0) {
      alert('유효기간은 오늘 이후 날짜여야 합니다.');
      return;
    }

    try {
      // API 형식에 맞게 변환
      const registerData: GifticonRegisterRequestDto[] = coupons.map(coupon => {
        // 날짜 형식 변환 (YYYY/MM/DD -> YYYY-MM-DD 또는 그대로)
        let formattedDate = coupon.expirationDate;
        if (formattedDate.includes('/')) {
          formattedDate = formattedDate.replace(/\//g, '-');
        }
        // YYYY-MM-DD 형식 확인
        if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
          throw new Error(`날짜 형식이 올바르지 않습니다: ${formattedDate}`);
        }

        return {
          brandName: coupon.store.trim(),
          productName: coupon.giftCardName.trim(),
          barcodeNumber: coupon.barcode.trim(),
          expiryDate: formattedDate,
          originalPrice: coupon.price,
          type: (coupon.type === 'amount' ? 'PREPAID' : 'PRODUCT') as GifticonType,
          imageUrl: coupon.imageUrl || '',
          // categoryName은 optional이므로 빈 문자열이나 undefined로 전송
          // 백엔드에서 브랜드명으로 카테고리를 자동으로 찾아주므로 생략 가능
        };
      });

      console.log('등록할 데이터:', JSON.stringify(registerData, null, 2));
      await registerGifticons(registerData);
      alert('쿠폰이 성공적으로 등록되었습니다.');
      goBack();
    } catch (error: any) {
      console.error('쿠폰 등록 실패:', error);
      const errorMessage = error?.message || '쿠폰 등록에 실패했습니다.';
      alert(errorMessage);
    }
  };

  return (
    <ContentLayout headerType="back" headerTitle="쿠폰 등록" onBack={goBackWithAlert}>
    <CouponCreateContainer>
      <StyledSwiper
        ref={swiperRef}
        modules={[Pagination]}
        slidesPerView={1.1}
        centeredSlides={true}
        loop={false}
        spaceBetween={30}
        pagination={{
          clickable: true,
        }}
        onSwiper={(swiper) => {
          setSwiperInstance(swiper);
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
        {coupons.map((coupon) => (
          <SwiperSlide key={coupon.id}>
            <CardWrapper>
              <DeleteButton 
                onClick={() => handleDeleteCoupon(coupon.id)} 
                aria-label="카드 삭제"
              >
                <CloseIcon />
              </DeleteButton>
              <InfoModifyCard
                imageUrl={coupon.imageUrl}
                giftCardName={coupon.giftCardName}
                barcode={coupon.barcode}
                store={coupon.store}
                type={coupon.type}
                price={coupon.price}
                expirationDate={coupon.expirationDate}
                onGiftCardNameChange={(value) => updateCoupon(coupon.id, 'giftCardName', value)}
                onBarcodeChange={(value) => updateCoupon(coupon.id, 'barcode', value)}
                onStoreChange={(value) => updateCoupon(coupon.id, 'store', value)}
                onTypeChange={(type) => updateCoupon(coupon.id, 'type', type)}
                onPriceChange={(value) => updateCoupon(coupon.id, 'price', value)}
                onExpirationDateChange={(value) => updateCoupon(coupon.id, 'expirationDate', value)}
              />
            </CardWrapper>
          </SwiperSlide>
        ))}
      </StyledSwiper>
      <AddButtonWrapper>
        <AddButton onClick={handleAddCoupon} aria-label="쿠폰 더 등록하기">
          <StyledText fontSize={14} fontWeight={600} color={COLORS.background.gray}>
            쿠폰 더 등록하기
          </StyledText>
        </AddButton>
      </AddButtonWrapper>
      <ButtonContainer>
        <DefaultButton children="쿠폰 등록" onClick={handleRegister} />    
      </ButtonContainer>
    </CouponCreateContainer>
    </ContentLayout>
  );
};

export default CouponCreate;
