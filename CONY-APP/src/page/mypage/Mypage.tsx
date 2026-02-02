import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MyInfoCard from '@/components/mypage/MyInfoCard';
import ContentLayout from '@/components/layout/ContentLayout';
import ConnectAccount from '@/components/mypage/ConnectAccount';
import CouponStatTable from '@/components/mypage/CouponStatTable';
import WithdrawButton from '@/components/mypage/WithdrawButton';
import CouponList from '@/components/common/card/CouponList';
import GeofenceTestCard from '@/components/mypage/GeofenceTestCard';
import { COLORS } from '@/constants/colors';
import { getMyGifticons } from '@/api/gifticon/gifticonApi';
import { getMyRooms, getGifticonsInRoom } from '@/api/room/roomApi';
import { getMySaleStats } from '@/api/sale/saleApi';
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
  const navigation = useNavigation();
  const [sellingCoupons, setSellingCoupons] = useState<GifticonListResponseDto[]>([]);
  const [myCouponCount, setMyCouponCount] = useState(0);
  const [sharedCouponCount, setSharedCouponCount] = useState(0);
  const [soldCouponCount, setSoldCouponCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 내 기프티콘 개수 조회
        const gifticonResponse = await getMyGifticons({ page: 0, size: 1 });
        setMyCouponCount(gifticonResponse.totalElements || 0);

        // 공유 중인 쿠폰 개수 (Room에 있는 쿠폰 개수)
        // 각 Room의 쿠폰 개수를 합산
        const rooms = await getMyRooms();
        let totalSharedCount = 0;
        for (const room of rooms) {
          try {
            const roomGifticons = await getGifticonsInRoom(room.roomId, 'ALL', undefined, { page: 0, size: 1 });
            totalSharedCount += roomGifticons.totalElements || 0;
          } catch (err) {
            console.error(`Room ${room.roomId} 쿠폰 개수 조회 실패:`, err);
          }
        }
        setSharedCouponCount(totalSharedCount);

        // 판매 중인 쿠폰 개수 (판매 대기 + 판매 중)
        const saleStats = await getMySaleStats();
        setSoldCouponCount((saleStats.onSaleCount || 0) + (saleStats.pendingCount || 0));

        // 판매 중인 기프티콘 목록
        const sellingResponse = await getMyGifticons({ page: 0, size: 20 });
        setSellingCoupons(sellingResponse.content);
      } catch (err) {
        console.error('데이터 조회 실패:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <ContentLayout headerTitle="마이페이지">
      <ScrollView>
        <View style={styles.container}>
          <MyInfoCard />
          <CouponStatTable 
            myCouponCount={myCouponCount} 
            sharedCouponCount={sharedCouponCount} 
            soldCouponCount={soldCouponCount} 
          />
          <View style={styles.divider}>
            <CouponList 
              coupons={sellingCoupons} 
              title="판매 중인 기프티콘" 
              onMoreClick={() => {
                (navigation as any).navigate('MySalesPage');
              }}
            />
          </View>
          <GeofenceTestCard />
          <ConnectAccount />
          <WithdrawButton />
        </View>
      </ScrollView>
    </ContentLayout>
  );
};

export default Mypage;
