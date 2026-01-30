import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import ContentLayout from '@/components/layout/ContentLayout';
import FolderList from '@/components/couponBox/FolderList';
import { FolderData } from '@/types/coupon/coupon';
import ShareCoupon from '@/components/couponBox/ShareCoupon';
import Filter from '@/components/couponBox/filter/Filter';
import AvailableFilter from '@/components/couponBox/filter/AvailableFilter';
import HorizontalGiftCard from '@/components/common/card/atomic/HorizontalGiftCard';
import { getMyGifticons } from '@/api/gifticon/gifticonApi';
import { GifticonListResponseDto } from '@/types/gifticon/gifticon';

const styles = StyleSheet.create({
  sharedCouponContainer: {
    alignItems: 'center',
  },
  couponsContainer: {
    width: '100%',
    flexWrap: 'wrap',
    gap: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '6%',
    paddingBottom: '6%',
  },
  stickyHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backgroundColor: '#f5f5f5',
  },
});

const CouponList = () => {
  const [coupons, setCoupons] = useState<GifticonListResponseDto[]>([]);
  const folders: FolderData[] = [
    { id: '1', title: '쿠폰함', type: 'selected' },
    { id: '2', title: '쿠폰함', type: 'unselected' },
    { id: '3', title: '쿠폰함', type: 'unselected' },
    { id: '4', title: '쿠폰함', type: 'unselected' },
    { id: '5', title: '쿠폰함', type: 'unselected' },
    { id: '6', title: '쿠폰함', type: 'unselected' },
    { id: '7', title: '쿠폰함', type: 'unselected' },
    { id: '8', title: '쿠폰함', type: 'unselected' },
    { id: '9', title: '쿠폰함', type: 'unselected' },
    { id: '10', title: '쿠폰함', type: 'unselected' },
  ];

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await getMyGifticons({ page: 0, size: 50 });
        setCoupons(response.content);
      } catch (err) {
        console.error('기프티콘 목록 조회 실패:', err);
      }
    };
    fetchCoupons();
  }, []);

  return (
    <ContentLayout headerTitle="내 쿠폰함">
      <ScrollView>
        <View style={styles.stickyHeader}>
          <FolderList folders={folders} />
        </View>
        <View style={styles.sharedCouponContainer}>
          <ShareCoupon />
        </View>
        <Filter />
        <AvailableFilter />
        <View style={styles.couponsContainer}>
          {coupons.map((coupon) => (
            <HorizontalGiftCard key={coupon.gifticonId} coupon={coupon} />
          ))}
        </View>
      </ScrollView>
    </ContentLayout>
  );
};

export default CouponList;
