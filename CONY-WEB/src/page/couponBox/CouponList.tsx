'use client';

import styled from "styled-components";
import ContentLayout from "@/components/layout/ContentLayout";
import FolderList from "@/components/couponBox/FolderList";
import { FolderData } from "@/types/coupon/coupon";
import ShareCoupon from "@/components/couponBox/ShareCoupon";
import Filter from "@/components/couponBox/filter/Filter";  
import AvailableFilter from "@/components/couponBox/filter/AvailableFilter";
import HorizontalGiftCard from "@/components/common/card/atomic/HorizontalGiftCard";
import { getCoupons } from "@/mockDB/mock";

const SharedCouponContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CouponsContainer = styled.div`
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
  justify-content: center;

  > *:first-child {
    margin-top: 6%;
  }

  > *:last-child {
    margin-bottom: 6%;
  }
`;

const CouponList = () => {
  const folders = [
    { id: "1", title: "쿠폰함", type: "selected" },
    { id: "2", title: "쿠폰함", type: "unselected" },
    { id: "3", title: "쿠폰함", type: "unselected" },
    { id: "4", title: "쿠폰함", type: "unselected" },
    { id: "5", title: "쿠폰함", type: "unselected" },
    { id: "6", title: "쿠폰함", type: "unselected" },
    { id: "7", title: "쿠폰함", type: "unselected" },
    { id: "8", title: "쿠폰함", type: "unselected" },
    { id: "9", title: "쿠폰함", type: "unselected" },
    { id: "10", title: "쿠폰함", type: "unselected" },
  ];

  return (
    <ContentLayout>
        <div style={{ position: 'sticky', top: '0', zIndex: 10, background: 'linear-gradient(to bottom, #f5f5f5 0%, #f5f5f5 75%, rgba(224, 224, 224, 0) 100%)' }}>
          <FolderList folders={folders as FolderData[]} />
        </div>
        <SharedCouponContainer>
            <ShareCoupon />
        </SharedCouponContainer>
        <Filter />
        <AvailableFilter />
        <CouponsContainer>
            {getCoupons().map((coupon) => (
                <HorizontalGiftCard coupon={coupon} />
            ))}
        </CouponsContainer>
    </ContentLayout>
  );
};

export default CouponList;