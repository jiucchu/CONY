import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { GifticonDetailResponseDto } from '@/types/gifticon/gifticon';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';
import { calculateDaysUntilExpiration } from '@/utils/DayUtils';
import DdayView from '@/components/common/card/atomic/DdayView';

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: '20%',
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    width: '100%',
  },
  imageContainer: {
    position: 'relative',
    width: '50%',
    maxWidth: 300,
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.background.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 16,
  },
  ddayWrapper: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  infoContainer: {
    alignItems: 'center',
    gap: 30,
    width: '100%',
  },
  priceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '60%',
    height: 50,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'relative',
  },
  priceLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  discountBadge: {
    backgroundColor: COLORS.primary,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});

const formatExpirationDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `~${year}. ${month}. ${day} 까지`;
};

interface DetailInfoCardProps {
  coupon: GifticonDetailResponseDto;
  originalPrice?: number;
  discountRate?: number;
}

const DetailInfoCard = ({
  coupon,
  originalPrice,
  discountRate,
}: DetailInfoCardProps) => {
  const daysUntilExpiration = calculateDaysUntilExpiration(coupon.expiryDate);
  const formattedExpiration = formatExpirationDate(coupon.expiryDate);
  const formattedPrice = coupon.originalPrice.toLocaleString('ko-KR');
  const formattedOriginalPrice = originalPrice ? originalPrice.toLocaleString('ko-KR') : '';
  const displayDiscountRate = discountRate || 0;

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <View style={styles.ddayWrapper}>
          <DdayView type="gift" dday={daysUntilExpiration} size="Medium" />
        </View>
        <Image source={{ uri: coupon.imageUrl }} style={styles.productImage} />
      </View>

      <View style={styles.infoContainer}>
        <View style={{ alignItems: 'center', gap: 5 }}>
          <StyledText fontSize={18} fontWeight={400} color={COLORS.text.secondary}>
            {coupon.brandName}
          </StyledText>
          <StyledText fontSize={25} fontWeight={700} color={COLORS.text.primary}>
            {coupon.productName}
          </StyledText>
          <StyledText fontSize={15} fontWeight={400} color={COLORS.text.primary}>
            {formattedExpiration}
          </StyledText>
        </View>
        <View style={styles.priceBanner}>
          <View style={styles.priceLeftSection}>
            <StyledText fontSize={15} fontWeight={700} color={COLORS.text.primary}>
              {formattedPrice}원
            </StyledText>
            {formattedOriginalPrice && (
              <StyledText fontSize={12} fontWeight={400} color={COLORS.text.secondary}>
                {formattedOriginalPrice}원
              </StyledText>
            )}
          </View>
          {displayDiscountRate > 0 && (
            <View style={styles.discountBadge}>
              <StyledText fontSize={12} fontWeight={600} color={COLORS.white}>
                {displayDiscountRate}%
              </StyledText>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default DetailInfoCard;
