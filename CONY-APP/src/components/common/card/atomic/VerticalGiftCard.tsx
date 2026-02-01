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
  containerDisabled: {
    opacity: 0.6,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    zIndex: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: COLORS.text.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 6,
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

  // 사용 완료 또는 만료 여부 확인
  const isUsed = coupon.status === 'USED' || ('isUsed' in coupon && coupon.isUsed === true);
  const isExpired = ('isExpired' in coupon && coupon.isExpired === true) || daysUntilExpiration < 0;
  const isDisabled = isUsed || isExpired;
  const badgeText = isUsed ? '사용 완료' : isExpired ? '기간 만료' : '';

  return (
    <View style={[styles.container, isDisabled && styles.containerDisabled]}>
      {isDisabled && (
        <View style={styles.overlay}>
          <View style={styles.badge}>
            <StyledText fontSize={12} fontWeight={700} color={COLORS.white}>
              {badgeText}
            </StyledText>
          </View>
        </View>
      )}
      <View style={styles.ddayWrapper}>
        <DdayView type="gift" dday={daysUntilExpiration} size="Small" />
      </View>
      <View style={styles.imageContainer}>
        {coupon.imageUrl && coupon.imageUrl.trim() !== '' ? (
          <Image 
            source={{ uri: coupon.imageUrl }} 
            style={styles.productImage}
            onError={(error) => {
              console.warn('이미지 로딩 실패:', coupon.imageUrl, error);
            }}
          />
        ) : (
          <View style={styles.productImage} />
        )}
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
