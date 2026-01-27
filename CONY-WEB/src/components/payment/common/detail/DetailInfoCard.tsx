'use client';

import styled from "styled-components";
import { GifticonDetailResponseDto } from "@/types/gifticon/gifticon";
import { COLORS } from "@/constants/colors";
import { StyledText } from "@/utils/StyledText";
import { calculateDaysUntilExpiration } from "@/utils/DayUtils";
import DdayView from "@/components/common/card/atomic/DdayView";

const CardContainer = styled.div`
  background-color: ${COLORS.white};
  border-radius: 20px;
  padding: 20% 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
`;

const ImageContainer = styled.div`
  position: relative;
  width: 50%;
  max-width: 300px;
  aspect-ratio: 1;
  border-radius: 16px;
  overflow: hidden;
  background-color: ${COLORS.background.lightGray};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
`;

const DdayWrapper = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  width: 100%;
`;

const PriceBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 60%;
  height: 50px;
  background-color: #f5f5f5;
  border-radius: 12px;
  padding: 12px 16px;
  position: relative;
`;

const PriceLeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const DiscountBadge = styled.div`
  background-color: ${COLORS.primary};
  color: ${COLORS.white};
  padding: 4px 10px;
  border-radius: 0 12px 0 12px ;
  font-family: 'Pretendard', sans-serif;
  font-size: 12px;
  font-weight: 600;
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const formatExpirationDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `~${year}. ${month}. ${day} 까지`;
};

interface DetailInfoCardProps {
  coupon: GifticonDetailResponseDto;
  originalPrice?: number;
  discountRate?: number;
}

const DetailInfoCard = ({ 
  coupon, 
  originalPrice,
  discountRate 
}: DetailInfoCardProps) => {
  const daysUntilExpiration = calculateDaysUntilExpiration(coupon.expiryDate);
  const formattedExpiration = formatExpirationDate(coupon.expiryDate);
  const formattedPrice = coupon.originalPrice.toLocaleString('ko-KR');
  const formattedOriginalPrice = originalPrice ? originalPrice.toLocaleString('ko-KR') : '';
  const displayDiscountRate = discountRate || 0;

  return (
    <CardContainer>
      <ImageContainer>
        <DdayWrapper>
          <DdayView type="gift" dday={daysUntilExpiration} size="Medium" />
        </DdayWrapper>
        <ProductImage src={coupon.imageUrl} alt={coupon.productName} />
      </ImageContainer>
      
      <InfoContainer>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
          <StyledText fontSize={18} fontWeight={400} color={COLORS.text.secondary}>
            {coupon.brandName}
          </StyledText>
        
          <StyledText fontSize={25} fontWeight={700} color={COLORS.text.primary}>
            {coupon.productName}
          </StyledText>
        
          <StyledText fontSize={15} fontWeight={400} color={COLORS.text.primary}>
            {formattedExpiration}
          </StyledText>
        </div>
        <PriceBanner>
          <PriceLeftSection>
            <StyledText fontSize={15} fontWeight={700} color={COLORS.text.primary}>{formattedPrice}원</StyledText>
            <StyledText fontSize={12} fontWeight={400} color={COLORS.text.secondary}>{formattedOriginalPrice}원</StyledText>
          </PriceLeftSection>
          <DiscountBadge>{displayDiscountRate}%</DiscountBadge>
        </PriceBanner>
      </InfoContainer>
    </CardContainer>
  );
};

export default DetailInfoCard;