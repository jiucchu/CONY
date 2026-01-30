'use client';

import styled from "styled-components";
import { COLORS } from "@/constants/colors";
import CommonCouponCard from "./CommonCouponCard";
import { GifticonDetailResponseDto, GifticonListResponseDto } from "@/types/gifticon/gifticon";

const SectionContainer = styled.div`
  width: 100%;
  margin-bottom: 24px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 0 5%; 
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
`;

const FairyIcon = styled.div`
  display: flex;
  align-items: center;
`;

const FontText = styled.p<{ fontSize: number; fontWeight: number; color: string }>`
  font-family: 'pretendard', sans-serif;
  font-size: ${props => props.fontSize}px;
  color: ${props => props.color};
  margin: 0;
  font-weight: ${props => props.fontWeight};
`;

const MoreLink = styled.a`
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: ${COLORS.text.secondary};
  text-decoration: none;
  cursor: pointer;
  
  &:hover {
    color: ${COLORS.text.primary};
  }
`;

const CardsContainer = styled.div`
  display: flex;
  gap: 25px;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 8px;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  > * {
    flex-shrink: 0;
  }
  
  > *:first-child {
    margin-left: 6%;
  }
  
  > *:last-child {
    margin-right: 6%;
  }
`;

interface CouponListProps {
  coupons: (GifticonDetailResponseDto | GifticonListResponseDto)[];
  title: string;
  onMoreClick?: () => void;
}

const CouponList = ({ coupons, title, onMoreClick }: CouponListProps) => {
  const displayCoupons = coupons.slice(0, 10);
  
  return (
    <SectionContainer>
      <SectionHeader>
        <TitleContainer>
          <FairyIcon></FairyIcon>
          <FontText fontSize={22} fontWeight={900} color={COLORS.primary}>🧚{title}</FontText>
        </TitleContainer>
        <MoreLink onClick={onMoreClick}>더보기 &gt;</MoreLink>
      </SectionHeader>
      <CardsContainer>
        {displayCoupons.map((coupon) => (
          <CommonCouponCard key={coupon.gifticonId} coupon={coupon} />
        ))}
      </CardsContainer>
    </SectionContainer>
  );
};

export default CouponList;
