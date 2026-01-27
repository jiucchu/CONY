'use client';

import styled from "styled-components";
import ContentLayout from "@/components/layout/ContentLayout";
import InfoModifyCard from "@/components/InfoModify/InfoModifyCard";
import { DefaultButton } from "@/components/common/atomic/Button";
import { useState } from "react";
import { GifticonDetailResponseDto } from "@/types/gifticon/gifticon";
import { COLORS } from "@/constants/colors";

const CouponModifyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 20px;
  gap: 24px;
`;

interface CouponModifyProps {
  coupon: GifticonDetailResponseDto;
  onClose?: () => void;
  onSubmit?: (updatedCoupon: Partial<GifticonDetailResponseDto>) => void;
}

const CouponModify = ({ coupon, onClose, onSubmit }: CouponModifyProps) => {
  const [formData, setFormData] = useState({
    imageUrl: coupon.imageUrl || '',
    giftCardName: coupon.productName || '',
    barcode: coupon.barcodeNumber || '',
    store: coupon.brandName || '',
    type: 'amount' as 'product' | 'amount',
    price: coupon.originalPrice || 0,
    expirationDate: coupon.expiryDate || '',
  });

  const handleImageEdit = () => {
    console.log('이미지 편집 클릭');
    // 이미지 편집 로직 추가
  };

  const handleSubmit = () => {
    const updatedCoupon: Partial<GifticonDetailResponseDto> = {
      productName: formData.giftCardName,
      brandName: formData.store,
      originalPrice: formData.price,
      expiryDate: formData.expirationDate,
      imageUrl: formData.imageUrl,
      barcodeNumber: formData.barcode,
    };
    onSubmit?.(updatedCoupon);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      if (typeof window !== 'undefined') {
        window.history.back();
      }
    }
  };

  return (
    <>
      <CouponModifyContainer>
        <InfoModifyCard
          imageUrl={formData.imageUrl}
          giftCardName={formData.giftCardName}
          barcode={formData.barcode}
          store={formData.store}
          type={formData.type}
          price={formData.price}
          expirationDate={formData.expirationDate}
          onImageEdit={handleImageEdit}
          onGiftCardNameChange={(value) => setFormData({ ...formData, giftCardName: value })}
          onBarcodeChange={(value) => setFormData({ ...formData, barcode: value })}
          onStoreChange={(value) => setFormData({ ...formData, store: value })}
          onTypeChange={(type) => setFormData({ ...formData, type })}
          onPriceChange={(value) => setFormData({ ...formData, price: value })}
          onExpirationDateChange={(value) => setFormData({ ...formData, expirationDate: value })}
        />
      </CouponModifyContainer>
      
      <div style={{ width: '60%', margin: '20px auto 60px auto' }}>
        <DefaultButton onClick={handleSubmit}>수정 완료</DefaultButton>
      </div>
    </>
  );
};

export default CouponModify;
