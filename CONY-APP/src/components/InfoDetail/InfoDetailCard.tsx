import React from 'react';
import { View, Alert } from 'react-native';
import styled from 'styled-components/native';
import { GifticonDetailResponseDto } from '@/types/gifticon/gifticon';
import DdayView from '@/components/common/card/atomic/DdayView';
import { COLORS } from '@/constants/colors';
import { calculateDaysUntilExpiration } from '@/utils/DayUtils';
import { StyledText } from '@/utils/StyledText';
import { Svg, Path, Line } from 'react-native-svg';
import BarcodeView from '@/components/common/barcode/BarcodeView';

const Container = styled.View`
  background-color: #FFFFFF;
  border-radius: 10px;
  width: 90%;
  padding-vertical: 10%;
  padding-horizontal: 20%;
  align-items: center;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.15;
  shadow-radius: 10px;
  elevation: 5;
  position: relative;
`;

const ImageContainer = styled.View`
  width: 80%;
  aspect-ratio: 1;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  margin-bottom: 16px;
  background-color: #E5E5E5;
`;

const ProductImage = styled.Image`
  width: 100%;
  height: 100%;
  background-color: #E5E5E5;
  border-radius: 10px;
  resize-mode: cover;
`;

const DdayWrapper = styled.View`
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
`;

const ActionButtonsWrapper = styled.View`
  position: absolute;
  top: 12px;
  right: 12px;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  z-index: 20;
`;

const ActionButton = styled.TouchableOpacity`
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
  border-width: 1px;
  border-color: ${COLORS.background.lightGray};
  border-radius: 16px;
`;

const InfoContainer = styled.View`
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
`;

const BarcodeContainer = styled.View`
  align-items: center;
  width: 100%;
  margin-top: 8px;
`;

const BarcodeWrapper = styled.View`
  justify-content: center;
  align-items: center;
  width: 100%;
  padding-horizontal: 20px;
`;

const BarcodeText = styled.View`
  margin-top: 12px;
`;

const EditIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={COLORS.text.primary} strokeWidth={2}>
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Svg>
);

const DeleteIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={COLORS.text.primary} strokeWidth={2}>
    <Line x1="3" y1="6" x2="21" y2="6" />
    <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <Line x1="10" y1="11" x2="10" y2="17" />
    <Line x1="14" y1="11" x2="14" y2="17" />
  </Svg>
);

const formatExpirationDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `~${year}. ${month}. ${day} 까지`;
};

const formatBarcodeNumber = (barcode: string): string => {
  const cleaned = barcode.replace(/\s/g, '');
  const parts = [];
  for (let i = 0; i < cleaned.length; i += 4) {
    parts.push(cleaned.slice(i, i + 4));
  }
  return parts.join(' ');
};

interface InfoDetailCardProps {
  coupon: GifticonDetailResponseDto;
  barcodeNumber?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

const InfoDetailCard = ({ coupon, barcodeNumber, onEdit, onDelete }: InfoDetailCardProps) => {
  const daysUntilExpiration = calculateDaysUntilExpiration(coupon.expiryDate);
  const formattedExpiration = formatExpirationDate(coupon.expiryDate);
  const defaultBarcode = barcodeNumber || String(coupon.gifticonId).padStart(16, '0');
  const formattedBarcode = formatBarcodeNumber(defaultBarcode);

  // Presigned URL을 React Native에서 안정적으로 로드하기 위해 정규화
  // 이미 인코딩된 URL이므로 그대로 사용하되, 공백이나 특수 문자 문제를 방지
  const imageUri = coupon.imageUrl ? coupon.imageUrl.trim() : null;

  const handleDelete = () => {
    Alert.alert(
      '삭제 확인',
      '정말 이 기프티콘을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <Container>
      <ActionButtonsWrapper>
        {onEdit && (
          <ActionButton onPress={onEdit}>
            <EditIcon />
          </ActionButton>
        )}
        {onDelete && (
          <ActionButton onPress={handleDelete}>
            <DeleteIcon />
          </ActionButton>
        )}
      </ActionButtonsWrapper>
      <ImageContainer>
        <DdayWrapper>
          <DdayView type="common" dday={daysUntilExpiration} size="Large" />
        </DdayWrapper>
        {imageUri && imageUri.trim() !== '' ? (
          <ProductImage 
            source={{ 
              uri: imageUri,
              cache: 'force-cache',
            }}
            resizeMode="cover"
            onError={(error: any) => {
              console.warn('[InfoDetailCard] 이미지 로딩 실패');
              console.warn('[InfoDetailCard] URL:', imageUri);
              console.warn('[InfoDetailCard] 에러 객체:', error);
              if (error?.nativeEvent) {
                console.warn('[InfoDetailCard] nativeEvent:', JSON.stringify(error.nativeEvent, null, 2));
              }
            }}
            onLoad={() => {
              console.log('[InfoDetailCard] 이미지 로딩 성공:', imageUri);
            }}
            onLoadStart={() => {
              console.log('[InfoDetailCard] 이미지 로딩 시작:', imageUri);
            }}
          />
        ) : (
          <View style={{ width: '100%', height: '100%', backgroundColor: '#E5E5E5', borderRadius: 10 }} />
        )}
      </ImageContainer>
      <InfoContainer>
        <View style={{ marginBottom: 5 }}>
          <StyledText fontSize={16} fontWeight={600} color={COLORS.text.secondary}>
            {coupon.brandName}
          </StyledText>
        </View>
        <StyledText fontSize={20} fontWeight={800} color={COLORS.text.primary}>
          {coupon.productName}
        </StyledText>
        <StyledText fontSize={16} fontWeight={400} color={COLORS.text.primary}>
          {formattedExpiration}
        </StyledText>
      </InfoContainer>
      <BarcodeContainer>
        <BarcodeWrapper>
          <BarcodeView 
            value={defaultBarcode} 
            width={280}
            height={80}
            format="CODE128"
          />
        </BarcodeWrapper>
        <BarcodeText>
          <StyledText fontSize={15} fontWeight={400} color={COLORS.text.primary}>
            {formattedBarcode}
          </StyledText>
        </BarcodeText>
      </BarcodeContainer>
    </Container>
  );
};

export default InfoDetailCard;
