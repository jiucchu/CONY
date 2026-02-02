import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';
import { SaleListResponseDto } from '@/types/sale/sale';
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

interface SaleCardProps {
  sale: SaleListResponseDto;
  showCancelButton?: boolean;
  onCancel?: (saleId: number) => void;
}

const SaleCard = ({ sale, showCancelButton = false, onCancel }: SaleCardProps) => {
  const daysLeft = calculateDaysUntilExpiration(sale.expiryDate);

  return (
    <Card>
      <ImageContainer>
        {sale.imageUrl ? (
          <ProductImage source={{ uri: sale.imageUrl }} />
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
            {sale.brandName}
          </StyledText>
          <StyledText fontSize={16} fontWeight={700} color={COLORS.text.primary}>
            {sale.productName}
          </StyledText>
          <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
            {sale.salePrice.toLocaleString('ko-KR')}원
          </StyledText>
        </InfoTextContainer>
        {showCancelButton && onCancel && (
          <ActionButton variant="cancel" onPress={() => onCancel(sale.saleId)}>
            <StyledText fontSize={12} fontWeight={600} color={COLORS.text.primary}>
              대기 취소
            </StyledText>
          </ActionButton>
        )}
      </InfoContainer>
    </Card>
  );
};

export default SaleCard;
