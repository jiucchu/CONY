import { Coupon } from "@/types/coupon/coupon";
import styled from "styled-components";
import DdayView from "./atomic/DdayView";
import { COLORS } from "@/constants/colors";
import { calculateDaysUntilExpiration } from "@/utils/DayUtils";
import { StyledText } from "@/utils/StyledText";

const CardContainer = styled.div`
  background-color: #FFFFFF;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  width: 45%;
  overflow: hidden;
  position: relative;
`;

const ImageContainer = styled.div`
  width: 100%;
  aspect-ratio: 1.4;
  flex: 2;
  background-color: #E5E5E5;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  min-height: 0;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const InfoContainer = styled.div`
  flex: 1;
  background-color: #FFFFFF;
  padding: 16px;
  display: flex;
  flex-direction: column;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-wrap: wrap;
`;

const DiscountBadge = styled.span`
  font-family: 'Pretendard', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: ${COLORS.primary};
`;

const DiscountPrice = styled.span`
  font-family: 'Pretendard', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: ${COLORS.text.primary};
  
  &::after {
    content: '원';
    font-size: 14px;
    font-weight: 700;
  }
`;

const OriginalPrice = styled.span`
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: ${COLORS.text.secondary};
  text-decoration: line-through;
  
  &::after {
    content: '원';
    font-size: 14px;
    font-weight: 400;
  }
`;

const DdayWrapper = styled.div`
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 10;
`;

interface CommonCouponCardProps {
  coupon: Coupon;
  discountRate?: number;
  originalPrice?: number;
}

const CommonCouponCard = ({ 
  coupon, 
  discountRate, 
  originalPrice 
}: CommonCouponCardProps) => {
  const daysUntilExpiration = calculateDaysUntilExpiration(coupon.expiration_date);
  const formattedPrice = coupon.price.toLocaleString('ko-KR');
  const formattedOriginalPrice = originalPrice ? originalPrice.toLocaleString('ko-KR') : '';
  
  const displayDiscountRate = discountRate || 0;
  const displayOriginalPrice = originalPrice || coupon.price;

  return (
    <CardContainer>
      <ImageContainer>
          <DdayWrapper>
            <DdayView type="common" dday={daysUntilExpiration} size="Medium" />
          </DdayWrapper>

        <ProductImage src={coupon.image_url} alt={coupon.title} />
      </ImageContainer>
      <InfoContainer>
        <StyledText fontSize={16} fontWeight={600} color={COLORS.text.secondary}>{coupon.brand}</StyledText>
        <StyledText fontSize={20} fontWeight={800} color={COLORS.text.primary}>{coupon.title}</StyledText>
        <PriceContainer>
            <DiscountBadge>{displayDiscountRate}%</DiscountBadge>
          <DiscountPrice>{formattedPrice}</DiscountPrice>
            <OriginalPrice>{formattedOriginalPrice}</OriginalPrice>
        </PriceContainer>
      </InfoContainer>
    </CardContainer>
  );
};

export default CommonCouponCard;
