import React from 'react';
import { TouchableOpacity, StyleSheet, Image, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GifticonDetailResponseDto, GifticonListResponseDto } from '@/types/gifticon/gifticon';
import DdayView from './atomic/DdayView';
import { COLORS } from '@/constants/colors';
import { calculateDaysUntilExpiration } from '@/utils/DayUtils';
import { StyledText } from '@/utils/StyledText';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: 200,
    minWidth: 180,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1.4,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  ddayWrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    flexWrap: 'wrap',
  },
  discountBadge: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  discountPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  originalPrice: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.text.secondary,
    textDecorationLine: 'line-through',
  },
});

interface CommonCouponCardProps {
  coupon: GifticonDetailResponseDto | GifticonListResponseDto;
  discountRate?: number;
  originalPrice?: number;
  handleCardClickProps?: () => void;
}

const CommonCouponCard = ({
  coupon,
  discountRate,
  originalPrice,
  handleCardClickProps,
}: CommonCouponCardProps) => {
  const navigation = useNavigation();
  const daysUntilExpiration = calculateDaysUntilExpiration(coupon.expiryDate);
  const couponOriginalPrice = 'originalPrice' in coupon ? coupon.originalPrice : 0;
  const hasValidPrice = couponOriginalPrice > 0;
  const formattedPrice = hasValidPrice ? couponOriginalPrice.toLocaleString('ko-KR') : '';
  const formattedOriginalPrice = originalPrice && originalPrice > 0 ? originalPrice.toLocaleString('ko-KR') : '';

  const displayDiscountRate = discountRate || 0;
  const displayOriginalPrice = originalPrice || couponOriginalPrice;
  const hasValidDisplayPrice = displayOriginalPrice > 0;

  // productName이 8글자 이상이면 말줄임 처리
  const displayProductName = coupon.productName.length > 8
    ? `${coupon.productName.substring(0, 8)}...`
    : coupon.productName;

  // 클릭 이벤트 함수
  const handleCardClick = () => {
    if (handleCardClickProps) {
      handleCardClickProps?.();
    } else {
      // React Navigation 사용
      (navigation as any).navigate('CouponDetail', { id: coupon.gifticonId });
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleCardClick}>
      <View style={styles.imageContainer}>
        <View style={styles.ddayWrapper}>
          <DdayView type="common" dday={daysUntilExpiration} size="Medium" />
        </View>
        <Image source={{ uri: coupon.imageUrl }} style={styles.productImage} />
      </View>
      <View style={styles.infoContainer}>
        <StyledText fontSize={13} fontWeight={600} color={COLORS.text.secondary}>
          {coupon.brandName}
        </StyledText>
        <StyledText fontSize={16} fontWeight={800} color={COLORS.text.primary}>
          {displayProductName}
        </StyledText>
        {hasValidDisplayPrice && (
          <View style={styles.priceContainer}>
            {displayDiscountRate > 0 && (
              <>
                <StyledText fontSize={16} fontWeight={700} color={COLORS.primary}>{displayDiscountRate}%</StyledText>
                {hasValidPrice && (
                  <StyledText fontSize={18} fontWeight={700} color={COLORS.text.primary}>{formattedPrice}원</StyledText>
                )}
              </>
            )}
            {!displayDiscountRate && hasValidPrice && (
              <StyledText fontSize={18} fontWeight={700} color={COLORS.text.primary}>{formattedPrice}원</StyledText>
            )}
            {formattedOriginalPrice && (
              <StyledText fontSize={14} fontWeight={400} color={COLORS.text.secondary}>{formattedOriginalPrice}원</StyledText>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default CommonCouponCard;
