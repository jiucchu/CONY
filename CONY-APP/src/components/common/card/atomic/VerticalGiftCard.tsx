import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { GifticonDetailResponseDto, GifticonListResponseDto } from '@/types/gifticon/gifticon';
import DdayView from './DdayView';
import { COLORS } from '@/constants/colors';
import { calculateDaysUntilExpiration } from '@/utils/DayUtils';
import { StyledText } from '@/utils/StyledText';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: 160,
    height: 240,
    padding: 20,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: 'gray',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 'auto',
    maxHeight: 200,
    resizeMode: 'contain',
  },
  infoContainer: {
    width: '100%',
  },
  ddayWrapper: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
});

const VerticalGiftCard = ({ coupon }: { coupon: GifticonDetailResponseDto | GifticonListResponseDto }) => {
  const daysUntilExpiration = calculateDaysUntilExpiration(coupon.expiryDate);
  const originalPrice = 'originalPrice' in coupon ? coupon.originalPrice : 0;
  const formattedPrice = originalPrice.toLocaleString('ko-KR');

  return (
    <View style={styles.container}>
      <View style={styles.ddayWrapper}>
        <DdayView type="gift" dday={daysUntilExpiration} size="Small" />
      </View>
      <View style={styles.imageContainer}>
        <Image source={{ uri: coupon.imageUrl }} style={styles.productImage} />
      </View>
      <View style={styles.infoContainer}>
        <StyledText fontSize={13} fontWeight={600} color={COLORS.text.secondary}>
          {coupon.brandName}
        </StyledText>
        <StyledText fontSize={20} fontWeight={800} color={COLORS.text.primary}>
          {coupon.productName}
        </StyledText>
        <StyledText fontSize={16} fontWeight={700} color={COLORS.text.primary}>
          {formattedPrice}원
        </StyledText>
      </View>
    </View>
  );
};

export default VerticalGiftCard;
