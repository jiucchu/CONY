import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, BackHandler } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import DetailInfoCard from '@/components/payment/common/detail/DetailInfoCard';
import { DefaultButton } from '@/components/common/atomic/Button';
import { GifticonDetailResponseDto, GifticonListResponseDto } from '@/types/gifticon/gifticon';
import ContentLayout from '@/components/layout/ContentLayout';
import CouponList from '@/components/common/card/CouponList';
import { getMyGifticons } from '@/api/gifticon/gifticonApi';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '10%',
  },
  buttonWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '50%',
    padding: 24,
  },
});

const PaymentDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { coupon } = (route.params as any) || {};
  const [recommendedCoupons, setRecommendedCoupons] = useState<GifticonListResponseDto[]>([]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if ((navigation as any).canGoBack()) {
        (navigation as any).goBack();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [navigation]);

  const handleBack = () => {
    if ((navigation as any).canGoBack()) {
      (navigation as any).goBack();
    }
  };

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const response = await getMyGifticons({ page: 0, size: 10 });
        setRecommendedCoupons(response.content);
      } catch (err) {
        console.error('추천 쿠폰 조회 실패:', err);
      }
    };
    fetchRecommended();
  }, []);

  if (!coupon) {
    return (
      <ContentLayout headerType="back" headerTitle="쿠폰 구매" onBack={handleBack}>
        <View style={styles.container}>
          <DefaultButton onPress={handleBack}>쿠폰 정보가 없습니다</DefaultButton>
        </View>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout headerType="back" headerTitle="쿠폰 구매" onBack={handleBack}>
      <ScrollView>
        <View style={styles.container}>
          <DetailInfoCard coupon={coupon as GifticonDetailResponseDto} />
          <View style={styles.buttonWrapper}>
            <DefaultButton onPress={() => console.log('구매하기')}>
              구매하기
            </DefaultButton>
          </View>
        </View>
        <CouponList coupons={recommendedCoupons} title="추천 쿠폰" />
      </ScrollView>
    </ContentLayout>
  );
};

export default PaymentDetail;
