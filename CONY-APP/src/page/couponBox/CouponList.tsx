import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import ContentLayout from '../../components/layout/ContentLayout';
import FolderList from '../../components/couponBox/FolderList';
import { FolderData } from '../../types/coupon/coupon';
import ShareCoupon from '../../components/couponBox/ShareCoupon';
import Filter from '../../components/couponBox/filter/Filter';
import AvailableFilter from '../../components/couponBox/filter/AvailableFilter';
import HorizontalGiftCard from '../../components/common/card/atomic/HorizontalGiftCard';
import { getMyGifticons } from '../../api/gifticon/gifticonApi';
import { GifticonListResponseDto } from '../../types/gifticon/gifticon';

const FolderContainer = styled.View`
  background-color: #f5f5f5;
`;

const SharedCouponContainer = styled.View`
  align-items: center;
  padding-vertical: 20px;
`;

const CouponsContainer = styled.View`
  width: 100%;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
  justify-content: center;
  padding-top: 6%;
  padding-bottom: 6%;
`;

const CouponWrapper = styled.View`
  width: 100%;
  align-items: center;
`;

const CouponList: React.FC = () => {
  const [coupons, setCoupons] = useState<GifticonListResponseDto[]>([]);
  const folders: FolderData[] = [
    { id: '1', title: '쿠폰함', type: 'selected' },
    { id: '2', title: '쿠폰함', type: 'unselected' },
    { id: '3', title: '쿠폰함', type: 'unselected' },
    { id: '4', title: '쿠폰함', type: 'unselected' },
    { id: '5', title: '쿠폰함', type: 'unselected' },
    { id: '6', title: '쿠폰함', type: 'unselected' },
    { id: '7', title: '쿠폰함', type: 'unselected' },
    { id: '8', title: '쿠폰함', type: 'unselected' },
    { id: '9', title: '쿠폰함', type: 'unselected' },
    { id: '10', title: '쿠폰함', type: 'unselected' },
  ];

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await getMyGifticons({ page: 0, size: 50 });
        setCoupons(response.content || []);
      } catch (err) {
        console.error('기프티콘 목록 조회 실패:', err);
      }
    };
    fetchCoupons();
  }, []);

  return (
    <ContentLayout>
      <FolderContainer>
        <FolderList folders={folders} />
      </FolderContainer>
      <SharedCouponContainer>
        <ShareCoupon />
      </SharedCouponContainer>
      <Filter />
      <AvailableFilter />
      <CouponsContainer>
        {coupons.map((coupon) => (
          <CouponWrapper key={coupon.gifticonId}>
            <HorizontalGiftCard coupon={coupon} />
          </CouponWrapper>
        ))}
      </CouponsContainer>
    </ContentLayout>
  );
};

export default CouponList;
