import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/colors';
import CommonCouponCard from './CommonCouponCard';
import { GifticonDetailResponseDto, GifticonListResponseDto } from '@/types/gifticon/gifticon';
import { StyledText } from '@/utils/StyledText';

const styles = StyleSheet.create({
  sectionContainer: {
    width: '100%',
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: '5%',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreLink: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  cardsContainer: {
    flexDirection: 'row',
    gap: 25,
    paddingBottom: 8,
  },
  scrollContent: {
    paddingLeft: '6%',
    paddingRight: '6%',
    gap: 10,
  },
  cardWrapper: {
    marginRight: 10,
    width: 200,
  },
});

interface CouponListProps {
  coupons: (GifticonDetailResponseDto | GifticonListResponseDto)[];
  title: string;
  onMoreClick?: () => void;
}

const CouponList = ({ coupons, title, onMoreClick }: CouponListProps) => {
  const displayCoupons = coupons.slice(0, 10);

  // 빈 배열이면 렌더링하지 않음
  if (displayCoupons.length === 0) {
    return null;
  }

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleContainer}>
          <StyledText fontSize={22} fontWeight={900} color={COLORS.primary}>
            🧚{title}
          </StyledText>
        </View>
        <TouchableOpacity onPress={onMoreClick}>
          <StyledText fontSize={14} fontWeight={500} color={COLORS.text.secondary}>
            더보기 &gt;
          </StyledText>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {displayCoupons.map((coupon, index) => (
          <View 
            key={coupon.gifticonId} 
            style={index < displayCoupons.length - 1 ? styles.cardWrapper : undefined}
          >
            <CommonCouponCard coupon={coupon} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default CouponList;
