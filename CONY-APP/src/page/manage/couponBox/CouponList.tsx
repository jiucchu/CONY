import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import ContentLayout from '@/components/layout/ContentLayout';
import FolderList from '@/components/couponBox/FolderList';
import { FolderData } from '@/types/coupon/coupon';
import ShareCoupon from '@/components/couponBox/ShareCoupon';
import Filter, { SortType } from '@/components/couponBox/filter/Filter';
import AvailableFilter, { AvailableType } from '@/components/couponBox/filter/AvailableFilter';
import HorizontalGiftCard from '@/components/common/card/atomic/HorizontalGiftCard';
import { getMyGifticons } from '@/api/gifticon/gifticonApi';
import { GifticonListResponseDto, GifticonSearchCondition } from '@/types/gifticon/gifticon';

const styles = StyleSheet.create({
  sharedCouponContainer: {
    alignItems: 'center',
  },
  couponsContainer: {
    width: '100%',
    gap: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '6%',
    paddingBottom: '6%',
  },
  stickyHeader: {
    position: 'relative',
    zIndex: 10,
    backgroundColor: '#f5f5f5',
  },
});

const CouponList = () => {
  const route = useRoute();
  const routeParams = route.params as { initialSort?: SortType; initialExpiringSoon?: boolean } | undefined;
  
  // MainPage에서 받은 filter 정보를 그대로 저장 (CouponDetail로 전달하기 위해)
  const [routeFilter, setRouteFilter] = useState<{ initialSort?: SortType; initialExpiringSoon?: boolean } | undefined>(routeParams);
  console.log('[CouponList] routeFilter:', routeFilter);
  
  const [coupons, setCoupons] = useState<GifticonListResponseDto[]>([]);
  const [selectedSort, setSelectedSort] = useState<SortType>(routeParams?.initialSort || 'period');
  const [selectedType, setSelectedType] = useState<AvailableType>('available');
  const [expiringSoon, setExpiringSoon] = useState<boolean>(routeParams?.initialExpiringSoon || false);
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

  const fetchCoupons = useCallback(async () => {
    try {
      // 정렬 설정
      let sort: string[] = [];
      if (selectedSort === 'period') {
        sort = ['expiryDate,asc'];
      } else if (selectedSort === 'registration') {
        sort = ['id,desc'];
      } else if (selectedSort === 'distance') {
        // 거리순은 위치 정보가 필요하므로 일단 등록순으로 대체
        sort = ['id,desc'];
      }

      // 필터 조건 설정
      const condition: GifticonSearchCondition = {};
      
      if (selectedType === 'available') {
        condition.excludeUsed = true;
      } else if (selectedType === 'used') {
        condition.excludeUsed = false;
        // 사용완료만 보려면 클라이언트에서 필터링 필요 (백엔드에 status 필터가 없음)
      }
      // 'all'일 때는 필터 없음

      if (expiringSoon) {
        condition.expiringSoon = true;
      }

      const response = await getMyGifticons(
        { page: 0, size: 50, sort },
        condition
      );
      
      console.log('[CouponList] API 응답:', JSON.stringify(response, null, 2));
      console.log('[CouponList] response.content:', response.content);
      console.log('[CouponList] response.content 타입:', typeof response.content);
      
      // 응답 구조 확인 및 안전 처리
      let filteredCoupons: GifticonListResponseDto[] = [];
      if (response && response.content && Array.isArray(response.content)) {
        filteredCoupons = response.content;
      } else if (Array.isArray(response)) {
        // 응답이 배열로 직접 오는 경우
        filteredCoupons = response;
      } else {
        console.warn('[CouponList] 예상치 못한 응답 구조:', response);
      }
      
      // 사용완료만 보기 필터 (백엔드에 status 필터가 없어서 클라이언트에서 필터링)
      if (selectedType === 'used') {
        filteredCoupons = filteredCoupons.filter(
          coupon => coupon.status === 'USED'
        );
      }

      setCoupons(filteredCoupons);
      console.log('[CouponList] 쿠폰 목록 설정 완료:', filteredCoupons.length, '개');
    } catch (err) {
      console.error('[CouponList] 기프티콘 목록 조회 실패:', err);
      if (err instanceof Error) {
        console.error('[CouponList] 에러 메시지:', err.message);
        console.error('[CouponList] 에러 스택:', err.stack);
      }
      // 에러 발생 시 빈 배열로 설정하여 앱이 크래시되지 않도록 함
      setCoupons([]);
    }
  }, [selectedSort, selectedType, expiringSoon]);

  // route params 변경 감지 및 상태 업데이트
  // route.params를 JSON.stringify로 비교하여 변경 감지
  const routeParamsString = route.params ? JSON.stringify(route.params) : 'null';
  const prevRouteParamsString = useRef<string>(routeParamsString);
  const prevSelectedSort = useRef<SortType>(selectedSort);
  const prevExpiringSoon = useRef<boolean>(expiringSoon);
  
  // route params가 변경될 때만 상태 업데이트 (MainPage에서 navigate할 때)
  useEffect(() => {
    const params = route.params as { initialSort?: SortType; initialExpiringSoon?: boolean } | undefined;
    
    // route params가 실제로 변경되었는지 확인
    if (prevRouteParamsString.current !== routeParamsString) {
      console.log('[CouponList] route params 변경 감지:', params);
      prevRouteParamsString.current = routeParamsString;
      
      // route params가 변경되면 routeFilter와 필터 상태 업데이트
      if (params) {
        console.log('[CouponList] route params로 필터 상태 업데이트');
        setRouteFilter(params);
        
        // initialSort가 있으면 업데이트
        if (params.initialSort !== undefined) {
          setSelectedSort(params.initialSort);
          prevSelectedSort.current = params.initialSort;
        }
        
        // initialExpiringSoon이 있으면 업데이트
        if (params.initialExpiringSoon !== undefined) {
          setExpiringSoon(params.initialExpiringSoon);
          prevExpiringSoon.current = params.initialExpiringSoon;
        }
      }
    }
  }, [routeParamsString]);

  // 사용자가 필터를 변경하면 routeFilter도 업데이트 (CouponDetail로 전달하기 위해)
  useEffect(() => {
    // 이전 값과 비교하여 실제로 사용자가 변경한 경우만 업데이트
    const isUserChange = prevSelectedSort.current !== selectedSort || prevExpiringSoon.current !== expiringSoon;
    
    if (isUserChange) {
      console.log('[CouponList] 사용자 필터 변경 감지 - selectedSort:', selectedSort, 'expiringSoon:', expiringSoon);
      prevSelectedSort.current = selectedSort;
      prevExpiringSoon.current = expiringSoon;
      setRouteFilter({
        initialSort: selectedSort,
        initialExpiringSoon: expiringSoon,
      });
    }
  }, [selectedSort, expiringSoon]);

  // 화면이 포커스될 때마다 route params 확인하여 필터 상태 업데이트
  useFocusEffect(
    useCallback(() => {
      const params = route.params as { initialSort?: SortType; initialExpiringSoon?: boolean } | undefined;
      console.log('[CouponList] useFocusEffect - route params:', params);
      
      // initialSort가 있으면 무조건 업데이트 (undefined가 아닌 경우만)
      if (params?.initialSort !== undefined) {
        console.log('[CouponList] useFocusEffect에서 initialSort 설정:', params.initialSort);
        setSelectedSort(params.initialSort);
      }
      
      // initialExpiringSoon이 있으면 무조건 업데이트
      if (params?.initialExpiringSoon !== undefined) {
        console.log('[CouponList] useFocusEffect에서 initialExpiringSoon 설정:', params.initialExpiringSoon);
        setExpiringSoon(params.initialExpiringSoon);
      }
    }, [])
  );

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  return (
    <ContentLayout headerTitle="내 쿠폰함">
      <ScrollView >
        <View style={styles.stickyHeader}>
          <FolderList folders={folders} />
        </View>
        <View style={styles.sharedCouponContainer}>
          <ShareCoupon />
        </View>
        <Filter 
          key={`filter-${selectedSort}`}
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
        />
        <AvailableFilter 
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />
        <View style={styles.couponsContainer}>
          {coupons.map((coupon) => (
            <HorizontalGiftCard 
              key={coupon.gifticonId} 
              coupon={coupon}
              filter={routeFilter}
            />
          ))}
        </View>
      </ScrollView>
    </ContentLayout>
  );
};

export default CouponList;
