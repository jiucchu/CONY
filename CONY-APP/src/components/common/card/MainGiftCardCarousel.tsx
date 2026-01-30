import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { GifticonDetailResponseDto, GifticonListResponseDto } from '@/types/gifticon/gifticon';
import MainGiftCard from './atomic/MainGiftCard';
import { COLORS } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = 300;
const CARD_SPACING = 20;

interface MainGiftCardCarouselProps {
  coupons: (GifticonDetailResponseDto | GifticonListResponseDto)[];
}

const MainGiftCardCarousel = ({ coupons }: MainGiftCardCarouselProps) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
      >
        {coupons.map((coupon) => (
          <View key={coupon.gifticonId} style={styles.cardWrapper}>
            <MainGiftCard coupon={coupon} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    
    paddingBottom: 32,
    minHeight: 450,
  },
  scrollContent: {
    paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
    paddingVertical: 30,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
  },
});

export default MainGiftCardCarousel;
