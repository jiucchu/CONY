import React from 'react';
import styled from 'styled-components/native';
import { Coupon } from '../../../../types/coupon/coupon';
import DdayView from './DdayView';
import BarcodeButton from './BarcodeButton';
import { COLORS } from '../../../../constants/colors';
import { StyledText } from '../../../../utils/StyledText';
import { calculateDaysUntilExpiration } from '../../../../utils/DayUtils';

interface HorizontalGiftCardProps {
  coupon: Coupon;
}

const HorizontalGiftCardContainer = styled.View`
  width: 90%;
  background-color: #FFFFFF;
  border-radius: 10px;
  flex-direction: row;
  padding: 16px;
  position: relative;
  max-width: 500px;
  gap: 16px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.15;
  shadow-radius: 10px;
  elevation: 4;
`;

const DdayWrapper = styled.View`
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 1;
`;

const ImageContainer = styled.View`
  width: 120px;
  height: 120px;
  min-width: 120px;
  background-color: gray;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: visible;
`;

const ProductImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const InfoContainer = styled.View`
  flex: 1;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
`;

const TextColumn = styled.View`
  flex-direction: column;
`;

const BarcodeWrapper = styled.View`
  position: absolute;
  bottom: 15px;
  right: 15px;
`;

const HorizontalGiftCard: React.FC<HorizontalGiftCardProps> = ({ coupon }) => {
  const daysUntilExpiration = calculateDaysUntilExpiration(coupon.expiration_date);
  const formattedPrice = coupon.price.toLocaleString('ko-KR');

  return (
    <HorizontalGiftCardContainer>
      <DdayWrapper>
        <DdayView type="gift" dday={daysUntilExpiration} size="Small" />
      </DdayWrapper>
      
      <ImageContainer>
        <ProductImage
          source={{ uri: coupon.image_url }}
          resizeMode="contain"
        />
      </ImageContainer>
      
      <InfoContainer>
        <StyledText fontSize={14} fontWeight={400} color={COLORS.text.secondary}>
          {coupon.brand}
        </StyledText>
        <TextColumn>
          <StyledText fontSize={23} fontWeight={900} color={COLORS.text.primary}>
            {coupon.title}
          </StyledText>
          <StyledText fontSize={16} fontWeight={700} color={COLORS.text.primary}>
            {formattedPrice}원
          </StyledText>
        </TextColumn>
      </InfoContainer>
      
      <BarcodeWrapper>
        <BarcodeButton width={45} />
      </BarcodeWrapper>
    </HorizontalGiftCardContainer>
  );
};

export default HorizontalGiftCard;
