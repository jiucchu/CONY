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
    width: 180,
    minWidth: 180,
    overflow: 'hidden',
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
  badgeText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
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

  // 사용 완료 또는 만료 여부 확인
  const isUsed = coupon.status === 'USED' || ('isUsed' in coupon && coupon.isUsed === true);
  const isExpired = ('isExpired' in coupon && coupon.isExpired === true) || daysUntilExpiration < 0;
  const isDisabled = isUsed || isExpired;
  const badgeText = isUsed ? '사용 완료' : isExpired ? '기간 만료' : '';

  // productName이 8글자 이상이면 말줄임 처리
  const displayProductName = coupon.productName.length > 8
    ? `${coupon.productName.substring(0, 8)}...`
    : coupon.productName;

  // Presigned URL을 React Native에서 안정적으로 로드하기 위해 정규화
  const imageUri = coupon.imageUrl ? coupon.imageUrl.trim() : null;

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
    <TouchableOpacity 
      style={[styles.container, isDisabled && styles.containerDisabled]} 
      onPress={handleCardClick}
    >
      <View style={styles.imageContainer}>
        {isDisabled && (
          <View style={styles.overlay}>
            <View style={styles.badge}>
              <StyledText fontSize={14} fontWeight={700} color={COLORS.white}>
                {badgeText}
              </StyledText>
            </View>
          </View>
        )}
        <View style={styles.ddayWrapper}>
          <DdayView type="common" dday={daysUntilExpiration} size="Medium" />
        </View>
        {imageUri ? (
          <Image 
            source={{ uri: imageUri }} 
            style={styles.productImage}
            resizeMode="cover"
            onError={(error: any) => {
              console.warn('[CommonCouponCard] 이미지 로딩 실패');
              console.warn('[CommonCouponCard] URL:', imageUri);
              console.warn('[CommonCouponCard] 에러 객체:', error);
              if (error?.nativeEvent) {
                console.warn('[CommonCouponCard] nativeEvent:', JSON.stringify(error.nativeEvent, null, 2));
              }
            }}
            onLoad={() => {
              console.log('[CommonCouponCard] 이미지 로딩 성공');
            }}
            onLoadStart={() => {
              console.log('[CommonCouponCard] 이미지 로딩 시작');
            }}
            onLoadEnd={() => {
              console.log('[CommonCouponCard] 이미지 로딩 종료');
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
