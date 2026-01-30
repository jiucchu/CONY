import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, BackHandler } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import InfoDetailCard from '@/components/InfoDetail/InfoDetailCard';
import { GifticonDetailResponseDto } from '@/types/gifticon/gifticon';
import { COLORS } from '@/constants/colors';
import { getGifticonDetail, useGifticon, cancelUseGifticon } from '@/api/gifticon/gifticonApi';
import ContentLayout from '@/components/layout/ContentLayout';
import { StyledText } from '@/utils/StyledText';
import { DefaultButton } from '@/components/common/atomic/Button';
import { Alert } from 'react-native';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    width: '80%',
    maxWidth: 500,
    marginTop: 24,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  usedButton: {
    backgroundColor: COLORS.primary,
  },
  sellButton: {
    backgroundColor: COLORS.secondary,
  },
});

const CouponDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = (route.params as any) || {};
  const [coupon, setCoupon] = useState<GifticonDetailResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    const fetchCoupon = async () => {
      if (!id) {
        setError('쿠폰 ID가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        const data = await getGifticonDetail(id);
        setCoupon(data);
      } catch (err: any) {
        setError(err.message || '쿠폰 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchCoupon();
  }, [id]);

  const handleUse = async () => {
    if (!coupon) return;

    // 사용된 쿠폰인 경우 취소 처리
    if (coupon.status === 'USED') {
      // 상품권(PREPAID)이고 사용 내역이 없는 경우
      // 상품권은 사용 내역이 없을 수 있으므로, 원래 금액으로 복구
      if (coupon.gifticonType === 'PREPAID' && (!coupon.histories || coupon.histories.length === 0)) {
        Alert.alert(
          '사용 취소',
          `정말 사용을 취소하시겠습니까?\n잔액이 ${coupon.originalPrice.toLocaleString('ko-KR')}원으로 복구됩니다.`,
          [
            {
              text: '취소',
              style: 'cancel',
            },
            {
              text: '확인',
              onPress: () => {
                try {
                  // 사용 내역이 없는 상품권의 경우, 프론트엔드에서 상태를 복구
                  // 실제 서버 상태는 변경되지 않지만, 사용자 경험을 위해 UI에서만 복구
                  setCoupon({
                    ...coupon,
                    status: 'NOT_USED',
                    currentBalance: coupon.originalPrice,
                  });
                  Alert.alert(
                    '알림',
                    '사용 취소되었습니다.\n\n참고: 사용 내역이 없는 상품권은 서버에서 직접 복구할 수 없습니다. 실제 복구를 위해서는 관리자에게 문의해주세요.'
                  );
                } catch (error: any) {
                  console.error('상태 복구 실패:', error);
                  Alert.alert('오류', '상태 복구에 실패했습니다.');
                }
              },
            },
          ]
        );
        return;
      }

      // 사용 내역이 있는 경우 (일반적인 경우)
      if (!coupon.histories || coupon.histories.length === 0) {
        Alert.alert('오류', '사용 내역이 없습니다. 이미 취소되었거나 사용 내역이 존재하지 않습니다.');
        return;
      }

      // 최근 사용 내역 찾기 (날짜순 정렬)
      const sortedHistories = [...coupon.histories].sort((a, b) => {
        const dateA = new Date(a.usedAt).getTime();
        const dateB = new Date(b.usedAt).getTime();
        return dateB - dateA;
      });
      
      const latestLog = sortedHistories[0];

      if (!latestLog || !latestLog.logId) {
        console.error('사용 내역 데이터:', coupon.histories);
        Alert.alert('오류', '사용 내역을 찾을 수 없습니다. 사용 내역 데이터가 올바르지 않습니다.');
        return;
      }

      Alert.alert(
        '사용 취소',
        '정말 사용을 취소하시겠습니까?',
        [
          {
            text: '취소',
            style: 'cancel',
          },
          {
            text: '확인',
            onPress: async () => {
              try {
                await cancelUseGifticon(latestLog.logId);
                Alert.alert('알림', '사용 취소되었습니다.', [
                  {
                    text: '확인',
                    onPress: async () => {
                      // 쿠폰 정보 다시 불러오기
                      const updatedCoupon = await getGifticonDetail(id);
                      setCoupon(updatedCoupon);
                    },
                  },
                ]);
              } catch (error: any) {
                console.error('사용 취소 실패:', error);
                const errorMessage = error?.message || '알 수 없는 오류가 발생했습니다.';
                console.error('에러 상세:', error);
                Alert.alert(
                  '오류',
                  `사용 취소에 실패했습니다.\n${errorMessage}\n\n이미 취소된 사용 내역이거나, 서버 오류가 발생했을 수 있습니다.`
                );
              }
            },
          },
        ]
      );
      return;
    }

    // 사용 완료 처리
    const confirmMessage = coupon.gifticonType === 'PREPAID' && coupon.currentBalance
      ? `정말 ${coupon.currentBalance.toLocaleString('ko-KR')}원을 사용 완료 처리하시겠습니까?`
      : '정말 사용 완료 처리하시겠습니까?';

    Alert.alert(
      '사용 완료',
      confirmMessage,
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '확인',
          onPress: async () => {
            try {
              // 사용 금액 결정
              const useAmount = coupon.gifticonType === 'PREPAID' && coupon.currentBalance
                ? coupon.currentBalance
                : coupon.originalPrice;

              // API 호출
              await useGifticon(id, { amount: useAmount });
              
              // 성공 메시지
              Alert.alert('알림', '사용 완료 처리되었습니다.', [
                {
                  text: '확인',
                  onPress: async () => {
                    // 쿠폰 정보 다시 불러오기
                    const updatedCoupon = await getGifticonDetail(id);
                    setCoupon(updatedCoupon);
                  },
                },
              ]);
            } catch (error: any) {
              console.error('사용 완료 처리 실패:', error);
              Alert.alert(
                '오류',
                `사용 완료 처리에 실패했습니다. ${error?.message || '알 수 없는 오류가 발생했습니다.'}`
              );
            }
          },
        },
      ]
    );
  };

  const handleSell = () => {
    // 판매 로직
    console.log('판매하기');
  };

  if (loading) {
    return (
      <ContentLayout headerType="back" headerTitle="쿠폰 상세" onBack={handleBack}>
        <View style={styles.container}>
          <StyledText fontSize={16} fontWeight={600} color={COLORS.text.primary}>로딩 중...</StyledText>
        </View>
      </ContentLayout>
    );
  }

  if (error || !coupon) {
    return (
      <ContentLayout headerType="back" headerTitle="쿠폰 상세" onBack={handleBack}>
        <View style={styles.container}>
          <StyledText fontSize={16} fontWeight={600} color={COLORS.text.error}>{error || '쿠폰을 찾을 수 없습니다.'}</StyledText>
        </View>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout headerType="back" headerTitle="쿠폰 상세" onBack={handleBack}>
      <ScrollView>
        <View style={styles.container}>
          <InfoDetailCard coupon={coupon} />
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.actionButton, styles.usedButton]}
              onPress={handleUse}
            >
              <StyledText fontSize={16} fontWeight={600} color={COLORS.white}>
                {coupon.status === 'USED' ? '사용 취소' : '사용 완료'}
              </StyledText>
            </TouchableOpacity>
            {coupon.status !== 'USED' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.sellButton]}
                onPress={handleSell}
              >
                <StyledText fontSize={16} fontWeight={600} color={COLORS.white}>
                  판매하기
                </StyledText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </ContentLayout>
  );
};

export default CouponDetail;
