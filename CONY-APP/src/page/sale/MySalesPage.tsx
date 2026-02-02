import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styled from 'styled-components/native';
import ContentLayout from '@/components/layout/ContentLayout';
import SaleTabBar from '@/components/sale/SaleTabBar';
import SaleSearchBar from '@/components/sale/SaleSearchBar';
import SaleCard from '@/components/sale/SaleCard';
import AutoSaleCard from '@/components/sale/AutoSaleCard';
import AddProductButton from '@/components/sale/AddProductButton';
import EmptyState from '@/components/sale/EmptyState';
import { getMySales, cancelSale } from '@/api/sale/saleApi';
import { getMyGifticons } from '@/api/gifticon/gifticonApi';
import { SaleListResponseDto, SaleStatus } from '@/types/sale/sale';
import { GifticonListResponseDto } from '@/types/gifticon/gifticon';
import { COLORS } from '@/constants/colors';

const Container = styled.View`
  flex: 1;
`;

const CouponListContainer = styled.View`
  padding: 20px;
  gap: 16px;
  padding-bottom: 100px;
`;

type TabType = 'PENDING' | 'ON_SALE' | 'SOLD_OUT';

const MySalesPage = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabType>('PENDING');
  const [sales, setSales] = useState<SaleListResponseDto[]>([]);
  const [autoSaleGifticons, setAutoSaleGifticons] = useState<GifticonListResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'PENDING') {
        // 판매 대기: 자동 판매 등록된 기프티콘 조회
        const response = await getMyGifticons({ page: 0, size: 50 });
        
        console.log('[MySalesPage] 전체 기프티콘 개수:', response.content.length);
        console.log('[MySalesPage] 첫 번째 기프티콘:', JSON.stringify(response.content[0], null, 2));
        
        // scheduledSaleDate가 있는 기프티콘만 필터링 (자동 판매 등록된 것)
        const autoSaleList = response.content.filter(
          (gifticon) => {
            const hasScheduledDate = !!(gifticon.scheduledSaleDate || gifticon.autoSellDate);
            // scheduledSaleDate만 있으면 자동 판매 등록된 것으로 간주 (plannedSalePrice는 선택사항)
            if (hasScheduledDate) {
              console.log('[MySalesPage] 자동 판매 기프티콘 발견:', {
                gifticonId: gifticon.gifticonId,
                productName: gifticon.productName,
                scheduledSaleDate: gifticon.scheduledSaleDate,
                autoSellDate: gifticon.autoSellDate,
                plannedSalePrice: gifticon.plannedSalePrice,
                autoSellAmount: gifticon.autoSellAmount,
              });
            }
            return hasScheduledDate;
          }
        );
        
        console.log('[MySalesPage] 자동 판매 등록된 기프티콘 개수:', autoSaleList.length);
        
        // 검색 키워드가 있으면 필터링
        const filtered = searchKeyword
          ? autoSaleList.filter(
              (gifticon) =>
                gifticon.brandName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                gifticon.productName.toLowerCase().includes(searchKeyword.toLowerCase())
            )
          : autoSaleList;
        
        setAutoSaleGifticons(filtered);
        setSales([]);
      } else {
        // 판매중, 판매 완료: 실제 판매 목록 조회
        const status: SaleStatus | undefined = activeTab === 'ON_SALE' ? 'ON_SALE' : 'SOLD_OUT';
        const response = await getMySales(status, searchKeyword || undefined, { page: 0, size: 50 });
        setSales(response.content);
        setAutoSaleGifticons([]);
      }
    } catch (error: any) {
      console.error('데이터 조회 실패:', error);
      Alert.alert('오류', '데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchKeyword]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handleCancelSale = async (saleId: number) => {
    Alert.alert(
      '판매 취소',
      '정말 판매를 취소하시겠습니까?',
      [
        { text: '아니오', style: 'cancel' },
        {
          text: '예',
          onPress: async () => {
            try {
              await cancelSale(saleId);
              Alert.alert('알림', '판매가 취소되었습니다.');
              fetchSales();
            } catch (error: any) {
              console.error('판매 취소 실패:', error);
              Alert.alert('오류', '판매 취소에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleCancelAutoSale = async (gifticonId: number) => {
    Alert.alert(
      '자동 판매 취소',
      '자동 판매 설정을 취소하시겠습니까?',
      [
        { text: '아니오', style: 'cancel' },
        {
          text: '예',
          onPress: async () => {
            try {
              // TODO: 자동 판매 취소 API 호출 (기프티콘 수정 API 사용)
              // await updateGifticon(gifticonId, { scheduledSaleDate: null, plannedSalePrice: null });
              Alert.alert('알림', '자동 판매 설정이 취소되었습니다.');
              fetchSales();
            } catch (error: any) {
              console.error('자동 판매 취소 실패:', error);
              Alert.alert('오류', '자동 판매 취소에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleAddProduct = () => {
    // 쿠폰 리스트로 이동하여 판매할 쿠폰 선택
    (navigation as any).navigate('CouponList');
  };

  const getEmptyMessage = () => {
    if (activeTab === 'PENDING') return '판매 대기 중인 쿠폰이 없습니다.';
    if (activeTab === 'ON_SALE') return '판매 중인 쿠폰이 없습니다.';
    return '판매 완료된 쿠폰이 없습니다.';
  };

  return (
    <ContentLayout headerTitle="판매 중인 쿠폰">
      <Container>
        <SaleTabBar activeTab={activeTab} onTabChange={setActiveTab} />
        <SaleSearchBar value={searchKeyword} onChangeText={setSearchKeyword} />

        <ScrollView>
          <CouponListContainer>
            {loading ? (
              <EmptyState message="로딩 중..." />
            ) : activeTab === 'PENDING' ? (
              autoSaleGifticons.length === 0 ? (
                <EmptyState message={getEmptyMessage()} />
              ) : (
                autoSaleGifticons.map((gifticon) => (
                  <AutoSaleCard
                    key={gifticon.gifticonId}
                    gifticon={gifticon}
                    onCancel={handleCancelAutoSale}
                  />
                ))
              )
            ) : sales.length === 0 ? (
              <EmptyState message={getEmptyMessage()} />
            ) : (
              sales.map((sale) => (
                <SaleCard
                  key={sale.saleId}
                  sale={sale}
                  showCancelButton={activeTab === 'ON_SALE'}
                  onCancel={handleCancelSale}
                />
              ))
            )}
          </CouponListContainer>
        </ScrollView>

        {activeTab !== 'SOLD_OUT' && (
          <AddProductButton onPress={handleAddProduct} />
        )}
      </Container>
    </ContentLayout>
  );
};

export default MySalesPage;
