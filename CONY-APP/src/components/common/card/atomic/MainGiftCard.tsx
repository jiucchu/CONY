import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GifticonDetailResponseDto, GifticonListResponseDto } from '@/types/gifticon/gifticon';
import { COLORS } from '@/constants/colors';
import { calculateDaysUntilExpiration } from '@/utils/DayUtils';
import DdayView from './DdayView';
import BarcodeButton from './BarcodeButton';
import { StyledText } from '@/utils/StyledText';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: 300,
    padding: 24,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 6,
  },
  topText: {
    marginBottom: 16,
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#E5E5E5',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  ddayWrapper: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  infoContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  textContainer: {
    flex: 1,
  },

});

const MainGiftCard = ({ coupon }: { coupon: GifticonDetailResponseDto | GifticonListResponseDto }) => {
  const navigation = useNavigation();
  const daysUntilExpiration = calculateDaysUntilExpiration(coupon.expiryDate);
  const couponOriginalPrice = 'originalPrice' in coupon ? coupon.originalPrice : 0;
  const hasValidPrice = couponOriginalPrice > 0;
  const formattedPrice = hasValidPrice ? couponOriginalPrice.toLocaleString('ko-KR') : '';

  // 사용 완료 또는 만료 여부 확인
  const isUsed = coupon.status === 'USED' || ('isUsed' in coupon && coupon.isUsed === true);
  const isExpired = ('isExpired' in coupon && coupon.isExpired === true) || daysUntilExpiration < 0;
  const isDisabled = isUsed || isExpired;
  const badgeText = isUsed ? '사용 완료' : isExpired ? '기간 만료' : '';

  const handleCardClick = () => {
    (navigation as any).navigate('CouponDetail', { id: coupon.gifticonId });
  };

  return (
    <TouchableOpacity 
      style={[styles.container, isDisabled && styles.containerDisabled]} 
      onPress={handleCardClick} 
      activeOpacity={0.8}
    >
      {isDisabled && (
        <View style={styles.overlay}>
          <View style={styles.badge}>
            <StyledText fontSize={14} fontWeight={700} color={COLORS.white}>
              {badgeText}
            </StyledText>
          </View>
        </View>
      )}
      <View style={styles.topText}>
        <StyledText fontSize={16} fontWeight={600} color={COLORS.text.secondary}>
          최근 12회 이용 브랜드
        </StyledText>
      </View>
      <View style={styles.imageContainer}>
        <View style={styles.ddayWrapper}>
          <DdayView type="gift" dday={daysUntilExpiration} size="Large" />
        </View>
        <Image source={{ uri: coupon.imageUrl }} style={styles.productImage} />
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.textContainer}>
          <StyledText fontSize={16} fontWeight={600} color={COLORS.text.secondary}>
            {coupon.brandName}
          </StyledText>
          <StyledText fontSize={25} fontWeight={800} color={COLORS.text.primary}>
            {coupon.productName}
          </StyledText>
          {hasValidPrice && (
            <StyledText fontSize={18} fontWeight={700} color={COLORS.text.primary}>
              {formattedPrice}원
            </StyledText>
          )}
        </View>

      </View>
    </TouchableOpacity>
  );
};

export default MainGiftCard;
