import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { GifticonDetailResponseDto, GifticonListResponseDto } from '@/types/gifticon/gifticon';
import DdayView from './DdayView';
import BarcodeButton from './BarcodeButton';
import { COLORS } from '@/constants/colors';
import { calculateDaysUntilExpiration } from '@/utils/DayUtils';
import { StyledText } from '@/utils/StyledText';

const styles = StyleSheet.create({
  container: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    flexDirection: 'row',
    padding: 16,
    position: 'relative',
    maxWidth: 500,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  ddayWrapper: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
  },
  imageContainer: {
    width: 120,
    height: 120,
    minWidth: 120,
    backgroundColor: 'gray',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 10,
    minWidth: 0,
  },
  textColumn: {
    flexDirection: 'column',
    gap: 4,
  },
  barcodeWrapper: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    zIndex: 1,
  },
});

const HorizontalGiftCard = ({ coupon }: { coupon: GifticonDetailResponseDto | GifticonListResponseDto }) => {
  const daysUntilExpiration = calculateDaysUntilExpiration(coupon.expiryDate);
  const originalPrice = 'originalPrice' in coupon ? coupon.originalPrice : 0;
  const hasValidPrice = originalPrice > 0;
  const formattedPrice = hasValidPrice ? originalPrice.toLocaleString('ko-KR') : '';

  return (
    <View style={styles.container}>
      <View style={styles.ddayWrapper}>
        <DdayView type="gift" dday={daysUntilExpiration} size="Small" />
      </View>
      <View style={styles.imageContainer}>
        <Image source={{ uri: coupon.imageUrl }} style={styles.productImage} />
      </View>
      <View style={styles.infoContainer}>
        <StyledText fontSize={14} fontWeight={400} color={COLORS.text.secondary}>
          {coupon.brandName}
        </StyledText>
        <View style={styles.textColumn}>
          <StyledText fontSize={19} fontWeight={900} color={COLORS.text.primary}>
            {coupon.productName}
          </StyledText>
          {hasValidPrice && (
            <StyledText fontSize={16} fontWeight={700} color={COLORS.text.primary}>
              {formattedPrice}원
            </StyledText>
          )}
        </View>
      </View>

    </View>
  );
};

export default HorizontalGiftCard;
