import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import MyInfoCard from '@/components/mypage/MyInfoCard';
import ContentLayout from '@/components/layout/ContentLayout';
import ConnectAccount from '@/components/mypage/ConnectAccount';
import CouponStatTable from '@/components/mypage/CouponStatTable';
import WithdrawButton from '@/components/mypage/WithdrawButton';
import CouponList from '@/components/common/card/CouponList';
import { COLORS } from '@/constants/colors';
import { getMyGifticons } from '@/api/gifticon/gifticonApi';
import { GifticonListResponseDto } from '@/types/gifticon/gifticon';

const styles = StyleSheet.create({
  container: {
    paddingVertical: '5%',
    gap: 40,
    alignItems: 'center',
    marginVertical: '2%',
    paddingBottom: '10%',
  },
  divider: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background.lightGray,
  },
});

const Mypage = () => {
  const [sellingCoupons, setSellingCoupons] = useState<GifticonListResponseDto[]>([]);

  useEffect(() => {
    const fetchSellingCoupons = async () => {
      try {
        const response = await getMyGifticons({ page: 0, size: 20 });
        // TODO: 판매 중인 기프티콘만 필터링
        setSellingCoupons(response.content);
      } catch (err) {
        console.error('판매 중인 기프티콘 조회 실패:', err);
      }
    };
    fetchSellingCoupons();
  }, []);

  return (
    <ContentLayout headerTitle="마이페이지">
      <ScrollView>
        <View style={styles.container}>
          <MyInfoCard />
          <CouponStatTable myCouponCount={0} sharedCouponCount={0} soldCouponCount={0} />
          <View style={styles.divider}>
            <CouponList coupons={sellingCoupons} title="판매 중인 기프티콘" />
          </View>
          <ConnectAccount />
          <WithdrawButton />
        </View>
      </ScrollView>
    </ContentLayout>
  );
};

export default Mypage;
