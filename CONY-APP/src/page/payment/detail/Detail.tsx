import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, BackHandler, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import DetailInfoCard from '@/components/payment/common/detail/DetailInfoCard';
import { DefaultButton } from '@/components/common/atomic/Button';
import { GifticonDetailResponseDto, GifticonListResponseDto } from '@/types/gifticon/gifticon';
import ContentLayout from '@/components/layout/ContentLayout';
import CouponList from '@/components/common/card/CouponList';
import { getMyGifticons } from '@/api/gifticon/gifticonApi';
import { purchaseGifticon } from '@/api/purchase/purchaseApi';
import { getPointBalance } from '@/api/point/pointApi';
import { readyPayment } from '@/api/payment/paymentApi';

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
  const [isPurchasing, setIsPurchasing] = useState(false);

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

  const handlePurchase = async () => {
    if (!coupon || !('saleId' in coupon) || !coupon.saleId) {
      Alert.alert('오류', '판매 정보를 찾을 수 없습니다.');
      return;
    }

    const saleId = coupon.saleId;
    const salePrice = 'salePrice' in coupon ? coupon.salePrice : 0;

    if (salePrice <= 0) {
      Alert.alert('오류', '판매 가격 정보가 올바르지 않습니다.');
      return;
    }

    setIsPurchasing(true);

    try {
      // 포인트 잔액 확인
      const pointInfo = await getPointBalance();
      const currentBalance = pointInfo.pointBalance || 0;

      // 포인트가 부족한 경우 카카오페이로 충전
      if (currentBalance < salePrice) {
        const shortage = salePrice - currentBalance;
        const chargeAmount = Math.ceil(shortage / 1000) * 1000; // 천원 단위로 올림

        Alert.alert(
          '포인트 부족',
          `포인트가 부족합니다.\n현재 잔액: ${currentBalance.toLocaleString('ko-KR')}원\n필요 금액: ${salePrice.toLocaleString('ko-KR')}원\n\n${chargeAmount.toLocaleString('ko-KR')}원을 충전하시겠습니까?`,
          [
            {
              text: '취소',
              style: 'cancel',
              onPress: () => setIsPurchasing(false),
            },
            {
              text: '충전하기',
              onPress: async () => {
                try {
                  // 카카오페이 결제 준비
                  const paymentResponse = await readyPayment({ amount: chargeAmount });
                  
                  // WebView로 카카오페이 결제 페이지 열기
                  (navigation as any).navigate('OAuthWebView', {
                    url: paymentResponse.next_redirect_mobile_url || paymentResponse.next_redirect_app_url,
                    provider: 'kakao',
                    paymentMode: true,
                    partnerOrderId: paymentResponse.tid,
                    saleId: saleId,
                  });
                } catch (error) {
                  console.error('결제 준비 오류:', error);
                  Alert.alert('오류', '결제 준비 중 오류가 발생했습니다.');
                } finally {
                  setIsPurchasing(false);
                }
              },
            },
          ]
        );
        return;
      }

      // 포인트가 충분한 경우 바로 구매
      await purchaseGifticon(saleId);
      Alert.alert('구매 완료', '기프티콘 구매가 완료되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            (navigation as any).goBack();
          },
        },
      ]);
    } catch (error: any) {
      console.error('구매 오류:', error);
      const errorMessage = error.message || '구매 중 오류가 발생했습니다.';
      
      // 포인트 부족 오류인 경우
      if (errorMessage.includes('포인트') || errorMessage.includes('잔액')) {
        const shortage = salePrice;
        const chargeAmount = Math.ceil(shortage / 1000) * 1000;

        Alert.alert(
          '포인트 부족',
          `${errorMessage}\n\n${chargeAmount.toLocaleString('ko-KR')}원을 충전하시겠습니까?`,
          [
            {
              text: '취소',
              style: 'cancel',
            },
            {
              text: '충전하기',
              onPress: async () => {
                try {
                  const paymentResponse = await readyPayment({ amount: chargeAmount });
                  (navigation as any).navigate('OAuthWebView', {
                    url: paymentResponse.next_redirect_mobile_url || paymentResponse.next_redirect_app_url,
                    provider: 'kakao',
                    paymentMode: true,
                    partnerOrderId: paymentResponse.tid,
                    saleId: saleId,
                  });
                } catch (paymentError) {
                  console.error('결제 준비 오류:', paymentError);
                  Alert.alert('오류', '결제 준비 중 오류가 발생했습니다.');
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('구매 실패', errorMessage);
      }
    } finally {
      setIsPurchasing(false);
    }
  };

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
            {isPurchasing ? (
              <View style={{ padding: 24, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#007AFF" />
              </View>
            ) : (
              <DefaultButton onPress={handlePurchase}>
                구매하기
              </DefaultButton>
            )}
          </View>
        </View>
        <CouponList coupons={recommendedCoupons} title="추천 쿠폰" />
      </ScrollView>
    </ContentLayout>
  );
};

export default PaymentDetail;
