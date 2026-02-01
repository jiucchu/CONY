import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
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

interface HorizontalGiftCardProps {
  coupon: GifticonDetailResponseDto | GifticonListResponseDto;
  filter?: {
    initialSort?: string;
    initialExpiringSoon?: boolean;
  };
}

const HorizontalGiftCard = ({ coupon, filter }: HorizontalGiftCardProps) => {
  const navigation = useNavigation();
  const daysUntilExpiration = calculateDaysUntilExpiration(coupon.expiryDate);
  const originalPrice = 'originalPrice' in coupon ? coupon.originalPrice : 0;
  const hasValidPrice = originalPrice > 0;
  const formattedPrice = hasValidPrice ? originalPrice.toLocaleString('ko-KR') : '';

  // 사용 완료 또는 만료 여부 확인
  const isUsed = coupon.status === 'USED' || ('isUsed' in coupon && coupon.isUsed === true);
  const isExpired = ('isExpired' in coupon && coupon.isExpired === true) || daysUntilExpiration < 0;
  const isDisabled = isUsed || isExpired;
  const badgeText = isUsed ? '사용 완료' : isExpired ? '기간 만료' : '';

  const handleCardClick = () => {
    (navigation as any).navigate('CouponDetail', { 
      id: coupon.gifticonId,
      ...(filter && { initialSort: filter.initialSort, initialExpiringSoon: filter.initialExpiringSoon })
    });
  };

  return (
    <TouchableOpacity 
      style={[styles.container, isDisabled && styles.containerDisabled]} 
      onPress={handleCardClick}
      disabled={false} // 클릭은 가능하지만 시각적으로 비활성화 표시
    >
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

    </TouchableOpacity>
  );
};

export default HorizontalGiftCard;
