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
import { getSalesOnSale } from '@/api/sale/saleApi';
import { SaleListResponseDto } from '@/types/sale/sale';

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
  const [coupons, setCoupons] = useState<SaleListResponseDto[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getSalesOnSale(undefined, { page: 0, size: 20 });
        setCoupons(response.content);
        const uniqueBrands = Array.from(new Set(response.content.map(c => c.brandName)));
        setBrands(uniqueBrands);
      } catch (err) {
        console.error('판매 중인 기프티콘 목록 조회 실패:', err);
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
            {coupons.map((sale) => (
              <View key={sale.saleId} style={styles.couponWrapper}>
                <CommonCouponCard
                  coupon={{
                    gifticonId: sale.gifticonId,
                    brandName: sale.brandName,
                    productName: sale.productName,
                    barcodeNumber: '',
                    expiryDate: sale.expiryDate,
                    status: 'NOT_USED' as const,
                    imageUrl: sale.imageUrl,
                  }}
                  discountRate={sale.originalPrice > 0 ? Math.round((1 - sale.salePrice / sale.originalPrice) * 100) : 0}
                  originalPrice={sale.originalPrice}
                  handleCardClickProps={() => {
                    (navigation as any).navigate('PaymentDetail', { 
                      coupon: {
                        ...sale,
                        gifticonType: 'PRODUCT' as const,
                        originalPrice: sale.originalPrice,
                      }
                    });
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
