import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ContentLayout from '@/components/layout/ContentLayout';
import BarFilter from '@/components/payment/common/BarFilter';
import Filter from '@/components/payment/common/Filter';
import CouponList from '@/components/common/card/CouponList';
import SearchBar from '@/components/payment/common/SearchBar';
import BrandFilterBar from '@/components/payment/common/BrandFilterBar';
import CommonCouponCard from '@/components/common/card/CommonCouponCard';
import RecentSearch from '@/components/common/RecentSearch';
import { getMyGifticons } from '@/api/gifticon/gifticonApi';
import { GifticonListResponseDto } from '@/types/gifticon/gifticon';

const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth - 60) / 2; // 화면 너비에서 패딩과 gap 제외 후 2로 나눔

const styles = StyleSheet.create({
  container: {
    paddingVertical: '5%',
    gap: 20,
  },
  couponContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 20,
    paddingHorizontal: 20,
  },
  couponWrapper: {
    width: cardWidth,
    alignItems: 'center',
  },
});

const Main = () => {
  const navigation = useNavigation();
  const [coupons, setCoupons] = useState<GifticonListResponseDto[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getMyGifticons({ page: 0, size: 20 });
        setCoupons(response.content);
        const uniqueBrands = Array.from(new Set(response.content.map(c => c.brandName)));
        setBrands(uniqueBrands);
      } catch (err) {
        console.error('기프티콘 목록 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <ContentLayout headerTitle="쿠폰 구매">
      <ScrollView
        onScrollBeginDrag={() => {
          if (isSearchFocused) {
            setIsSearchFocused(false);
          }
        }}
      >
        <View style={styles.container}>
          <SearchBar onFocusChange={setIsSearchFocused} />
          {isSearchFocused && (
            <RecentSearch
              visible={isSearchFocused}
              searches={recentSearches}
              onSearchClick={(term) => {
                console.log('검색어 클릭:', term);
              }}
              onClose={() => setIsSearchFocused(false)}
            />
          )}
          <BarFilter />
          <BrandFilterBar brands={brands} />
          <Filter />
          <View style={styles.couponContainer}>
            {coupons.map((coupon) => (
              <View key={coupon.gifticonId} style={styles.couponWrapper}>
                <CommonCouponCard
                  coupon={coupon}
                  handleCardClickProps={() => {
                    (navigation as any).navigate('PaymentDetail', { coupon });
                  }}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ContentLayout>
  );
};

export default Main;
