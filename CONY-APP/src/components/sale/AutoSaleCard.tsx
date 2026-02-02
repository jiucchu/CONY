import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';
import { GifticonListResponseDto } from '@/types/gifticon/gifticon';
import DdayView from '@/components/common/card/atomic/DdayView';
import { calculateDaysUntilExpiration } from '@/utils/DayUtils';

const Card = styled.View`
  background-color: ${COLORS.white};
  border-radius: 10px;
  padding: 16px;
  flex-direction: row;
  gap: 16px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
  margin-bottom: 12px;
`;

const ImageContainer = styled.View`
  width: 100px;
  height: 100px;
  background-color: ${COLORS.background.lightGray};
  border-radius: 10px;
  position: relative;
  overflow: hidden;
`;

const ProductImage = styled.Image`
  width: 100%;
  height: 100%;
  resize-mode: cover;
`;

const DdayWrapper = styled.View`
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 1;
`;

const InfoContainer = styled.View`
  flex: 1;
  justify-content: space-between;
`;

const InfoTextContainer = styled.View`
  gap: 4px;
`;

const ActionButton = styled.TouchableOpacity<{ variant?: 'cancel' | 'primary' }>`
  padding-vertical: 8px;
  padding-horizontal: 16px;
  border-radius: 8px;
  background-color: ${(props) => 
    props.variant === 'cancel' ? COLORS.background.lightGray : COLORS.primary};
  align-items: center;
  justify-content: center;
  min-width: 80px;
  margin-top: 8px;
`;

interface AutoSaleCardProps {
  gifticon: GifticonListResponseDto;
  onCancel?: (gifticonId: number) => void;
}

const AutoSaleCard = ({ gifticon, onCancel }: AutoSaleCardProps) => {
  const daysLeft = calculateDaysUntilExpiration(gifticon.expiryDate);
  const autoSaleDate = gifticon.scheduledSaleDate || gifticon.autoSellDate;
  const autoSaleAmount = gifticon.plannedSalePrice || gifticon.autoSellAmount || 0;

  return (
    <Card>
      <ImageContainer>
        {gifticon.imageUrl ? (
          <ProductImage source={{ uri: gifticon.imageUrl }} />
        ) : (
          <View style={{ flex: 1, backgroundColor: COLORS.background.lightGray }} />
        )}
        {daysLeft >= 0 && (
          <DdayWrapper>
            <DdayView type="gift" dday={daysLeft} size="Small" />
          </DdayWrapper>
        )}
      </ImageContainer>
      <InfoContainer>
        <InfoTextContainer>
          <StyledText fontSize={12} fontWeight={400} color={COLORS.text.secondary}>
            {gifticon.brandName}
          </StyledText>
          <StyledText fontSize={16} fontWeight={700} color={COLORS.text.primary}>
            {gifticon.productName}
          </StyledText>
          {autoSaleAmount > 0 && (
            <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
              {autoSaleAmount.toLocaleString('ko-KR')}원
            </StyledText>
          )}
        </InfoTextContainer>
        {onCancel && (
          <ActionButton variant="cancel" onPress={() => onCancel(gifticon.gifticonId)}>
            <StyledText fontSize={12} fontWeight={600} color={COLORS.text.primary}>
              대기 취소
            </StyledText>
          </ActionButton>
        )}
      </InfoContainer>
    </Card>
  );
};

export default AutoSaleCard;
