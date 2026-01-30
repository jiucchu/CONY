'use client';

import styled from "styled-components";
import ContentLayout from "@/components/layout/ContentLayout";
import InfoModifyCard from "@/components/InfoModify/InfoModifyCard";
import { DefaultButton } from "@/components/common/atomic/Button";
import { useState, useEffect, useMemo } from "react";
import { GifticonDetailResponseDto } from "@/types/gifticon/gifticon";
import { COLORS } from "@/constants/colors";
import { StyledText } from "@/utils/StyledText";
import { goBack } from "@/utils/utils";
import { getGifticonDetail, updateGifticonInfo } from "@/api/gifticon/gifticonApi";
import { GifticonUpdateRequestDto } from "@/types/gifticon/gifticon";

const CouponModifyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 20px;
  gap: 24px;
`;

const CouponModify = ({ id }: { id: number }) => {
  const [coupon, setCoupon] = useState<GifticonDetailResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API로 데이터 페칭
  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        setLoading(true);
        const data = await getGifticonDetail(id);
        setCoupon(data);
        setError(null);
      } catch (err) {
        console.error('기프티콘 조회 실패:', err);
        setError('기프티콘을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCoupon();
    }
  }, [id]);

  const initialFormData = useMemo(() => {
    if (!coupon) {
      return {
        imageUrl: '',
        giftCardName: '',
        barcode: '',
        store: '',
        categoryName: '',
        type: 'amount' as 'product' | 'amount',
        price: 0,
        expirationDate: '',
      };
    }
    return {
      imageUrl: coupon.imageUrl || '',
      giftCardName: coupon.productName || '',
      barcode: coupon.barcodeNumber || '',
      store: coupon.brandName || '',
      categoryName: coupon.categoryName || '',
      type: (coupon.gifticonType === 'PREPAID' ? 'amount' : 'product') as 'product' | 'amount',
      price: coupon.originalPrice || 0,
      expirationDate: coupon.expiryDate || '',
    };
  }, [coupon]);

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (coupon) {
      setFormData({
        imageUrl: coupon.imageUrl || '',
        giftCardName: coupon.productName || '',
        barcode: coupon.barcodeNumber || '',
        store: coupon.brandName || '',
        categoryName: coupon.categoryName || '',
        type: (coupon.gifticonType === 'PREPAID' ? 'amount' : 'product') as 'product' | 'amount',
        price: coupon.originalPrice || 0,
        expirationDate: coupon.expiryDate || '',
      });
    }
  }, [coupon]);

  if (loading) {
    return (
      <ContentLayout headerType="back" headerTitle="쿠폰 수정" onBack={goBack}>
        <CouponModifyContainer>
          <StyledText fontSize={18} fontWeight={600} color={COLORS.text.secondary}>
            로딩 중...
          </StyledText>
        </CouponModifyContainer>
      </ContentLayout>
    );
  }

  if (error || !coupon) {
    return (
      <ContentLayout headerType="back" headerTitle="쿠폰 수정" onBack={goBack}>
        <CouponModifyContainer>
          <StyledText fontSize={18} fontWeight={600} color={COLORS.text.secondary}>
            {error || '쿠폰을 찾을 수 없습니다.'}
          </StyledText>
        </CouponModifyContainer>
      </ContentLayout>
    );
  }

  const handleImageEdit = () => {
    console.log('이미지 편집 클릭');
    // 이미지 편집 로직 추가
  };

  const handleSubmit = async () => {
    // 필수 필드 검증
    if (!formData.giftCardName.trim() || !formData.store.trim() || !formData.expirationDate || formData.price <= 0) {
      alert('모든 필수 항목을 입력해주세요. (가격은 0보다 커야 합니다)');
      return;
    }

    // 날짜 형식 검증 및 변환
    let formattedDate = formData.expirationDate;
    if (formattedDate.includes('/')) {
      formattedDate = formattedDate.replace(/\//g, '-');
    }
    
    // YYYY-MM-DD 형식 확인
    if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
      alert('날짜 형식이 올바르지 않습니다. (YYYY-MM-DD 형식이어야 합니다)');
      return;
    }

    // 날짜 검증 (과거 날짜 체크)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(formattedDate);
    expiryDate.setHours(0, 0, 0, 0);
    
    if (expiryDate < today) {
      alert('유효기간은 오늘 이후 날짜여야 합니다.');
      return;
    }

    try {
      const updateData: GifticonUpdateRequestDto = {
        productName: formData.giftCardName.trim(),
        brandName: formData.store.trim(),
        categoryName: formData.categoryName?.trim() || undefined,
        originalPrice: formData.price,
        expiryDate: formattedDate,
      };
      
      console.log('수정할 데이터:', JSON.stringify(updateData, null, 2));
      await updateGifticonInfo(id, updateData);
      alert('쿠폰이 성공적으로 수정되었습니다.');
      goBack();
    } catch (err: any) {
      console.error('기프티콘 수정 실패:', err);
      alert(`기프티콘 수정에 실패했습니다. ${err.message || '서버 오류가 발생했습니다.'}`);
    }
  };

  return (
    <ContentLayout headerType="back" headerTitle="쿠폰 수정" onBack={goBack}>
      <CouponModifyContainer>
        <InfoModifyCard
          imageUrl={formData.imageUrl}
          giftCardName={formData.giftCardName}
          barcode={formData.barcode}
          store={formData.store}
          categoryName={formData.categoryName}
          type={formData.type}
          price={formData.price}
          expirationDate={formData.expirationDate}
          onImageEdit={handleImageEdit}
          onGiftCardNameChange={(value) => setFormData({ ...formData, giftCardName: value })}
          onBarcodeChange={(value) => setFormData({ ...formData, barcode: value })}
          onStoreChange={(value) => setFormData({ ...formData, store: value })}
          onCategoryNameChange={(value) => setFormData({ ...formData, categoryName: value })}
          onTypeChange={(type) => setFormData({ ...formData, type })}
          onPriceChange={(value) => setFormData({ ...formData, price: value })}
          onExpirationDateChange={(value) => setFormData({ ...formData, expirationDate: value })}
        />
      </CouponModifyContainer>
      
      <div style={{ width: '60%', margin: '20px auto 60px auto' }}>
        <DefaultButton onClick={handleSubmit}>수정 완료</DefaultButton>
      </div>
    </ContentLayout>
  );
};

export default CouponModify;
