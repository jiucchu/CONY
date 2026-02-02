import React, { useState, useEffect } from 'react';
import { ScrollView, BackHandler } from 'react-native';
import styled from 'styled-components/native';
import { useRoute, useNavigation } from '@react-navigation/native';
import InfoDetailCard from '@/components/InfoDetail/InfoDetailCard';
import RemainMoneyCard from '@/components/InfoDetail/RemainMoneyCard';
import AutoSellInfoCard from '@/components/InfoDetail/atomic/AutoSellInfoCard';
import { GifticonDetailResponseDto } from '@/types/gifticon/gifticon';
import { COLORS } from '@/constants/colors';
import { getGifticonDetail, useGifticon, cancelUseGifticon } from '@/api/gifticon/gifticonApi';
import { createSale } from '@/api/sale/saleApi';
import ContentLayout from '@/components/layout/ContentLayout';
import { StyledText } from '@/utils/StyledText';
import { DefaultButton } from '@/components/common/atomic/Button';
import { Alert, Platform } from 'react-native';
import { calculateDaysUntilExpiration } from '@/utils/DayUtils';

const Container = styled.View`
  align-items: center;
  padding: 30px;
  padding-bottom: 60px;
  gap: 20px;
`;

const ButtonGroup = styled.View`
  flex-direction: row;
  width: 80%;
  max-width: 500px;
  margin-top: 24px;
  justify-content: space-between;
`;

const ActionButton = styled.TouchableOpacity<{ variant: 'used' | 'sell' }>`
  flex: 1;
  padding-vertical: 14px;
  padding-horizontal: 20px;
  border-radius: 20px;
  align-items: center;
  justify-content: center;
  margin-horizontal: 6px;
  background-color: ${props => props.variant === 'used' ? COLORS.primary : COLORS.secondary};
`;

const DebugContainer = styled.View`
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 8px;
  margin-bottom: 10px;
`;

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
        console.log('[CouponDetail] 받아온 쿠폰 데이터:', JSON.stringify(data, null, 2));
        console.log('[CouponDetail] scheduledSaleDate:', data.scheduledSaleDate);
        console.log('[CouponDetail] plannedSalePrice:', data.plannedSalePrice);
        console.log('[CouponDetail] autoSellDate:', data.autoSellDate);
        console.log('[CouponDetail] autoSellAmount:', data.autoSellAmount);
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
    if (!coupon) return;

    // 히스토리가 있으면 판매 불가
    if (coupon.histories && coupon.histories.length > 0) {
      Alert.alert(
        '판매 불가',
        '사용 내역이 있는 쿠폰은 판매할 수 없습니다.'
      );
      return;
    }

    // 기본 판매 가격 제안 (원래 가격의 80%)
    const suggestedPrice = Math.floor(coupon.originalPrice * 0.8);
    const minPrice = 100; // 최소 판매 가격
    const defaultPrice = Math.max(suggestedPrice, minPrice);

    // iOS는 Alert.prompt 사용, Android는 간단한 확인 다이얼로그
    if (Platform.OS === 'ios') {
      Alert.prompt(
        '판매 가격 입력',
        `판매할 가격을 입력해주세요.\n(원래 가격: ${coupon.originalPrice.toLocaleString('ko-KR')}원)`,
        [
          {
            text: '취소',
            style: 'cancel',
          },
          {
            text: '확인',
            onPress: async (priceText: string | undefined) => {
              if (!priceText) {
                Alert.alert('알림', '판매 가격을 입력해주세요.');
                return;
              }

              const salePrice = parseInt(priceText.replace(/[^0-9]/g, ''), 10);
              if (isNaN(salePrice) || salePrice < minPrice) {
                Alert.alert('알림', `판매 가격은 최소 ${minPrice.toLocaleString('ko-KR')}원 이상이어야 합니다.`);
                return;
              }

              if (salePrice > coupon.originalPrice) {
                Alert.alert('알림', '판매 가격은 원래 가격보다 높을 수 없습니다.');
                return;
              }

              await submitSale(salePrice);
            },
          },
        ],
        'plain-text',
        defaultPrice.toString()
      );
    } else {
      // Android는 확인 다이얼로그로 기본 가격 제안
      Alert.alert(
        '판매하기',
        `이 쿠폰을 ${defaultPrice.toLocaleString('ko-KR')}원에 판매하시겠습니까?\n(원래 가격: ${coupon.originalPrice.toLocaleString('ko-KR')}원)`,
        [
          {
            text: '취소',
            style: 'cancel',
          },
          {
            text: '확인',
            onPress: () => submitSale(defaultPrice),
          },
        ]
      );
    }
  };

  const submitSale = async (salePrice: number) => {
    if (!coupon || !id) return;

    try {
      await createSale({
        gifticonId: id,
        originalPrice: coupon.originalPrice,
        salePrice: salePrice,
      });

      Alert.alert('알림', '판매글이 성공적으로 등록되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            // 쿠폰 정보 다시 불러오기
            handleUpdate();
          },
        },
      ]);
    } catch (error: any) {
      console.error('판매 등록 실패:', error);
      Alert.alert(
        '오류',
        `판매 등록에 실패했습니다.\n${error?.message || '알 수 없는 오류가 발생했습니다.'}`
      );
    }
  };

  if (loading) {
    return (
      <ContentLayout headerType="back" headerTitle="쿠폰 상세" onBack={handleBack}>
        <Container>
          <StyledText fontSize={16} fontWeight={600} color={COLORS.text.primary}>로딩 중...</StyledText>
        </Container>
      </ContentLayout>
    );
  }

  if (error || !coupon) {
    return (
      <ContentLayout headerType="back" headerTitle="쿠폰 상세" onBack={handleBack}>
        <Container>
          <StyledText fontSize={16} fontWeight={600} color={COLORS.text.error}>{error || '쿠폰을 찾을 수 없습니다.'}</StyledText>
        </Container>
      </ContentLayout>
    );
  }

  // 자동 판매 정보 계산 (백엔드 필드명 우선, 하위 호환성 위해 autoSellDate/autoSellAmount도 지원)
  const autoSellDate = coupon?.scheduledSaleDate || coupon?.autoSellDate || coupon?.expiryDate || '';
  const autoSellAmount = coupon?.plannedSalePrice || coupon?.autoSellAmount || 0;
  const daysLeftUntilAutoSell = autoSellDate ? calculateDaysUntilExpiration(autoSellDate) : 0;
  // scheduledSaleDate가 있고, plannedSalePrice가 0보다 크면 자동 판매 설정이 있는 것으로 간주
  const hasAutoSell = !!(coupon?.scheduledSaleDate || coupon?.autoSellDate) && autoSellAmount > 0 && daysLeftUntilAutoSell >= 0;
  
  if (coupon) {
    console.log('[CouponDetail] 자동 판매 정보 계산:');
    console.log('  - scheduledSaleDate:', coupon.scheduledSaleDate);
    console.log('  - plannedSalePrice:', coupon.plannedSalePrice);
    console.log('  - autoSellDate:', autoSellDate);
    console.log('  - autoSellAmount:', autoSellAmount);
    console.log('  - daysLeftUntilAutoSell:', daysLeftUntilAutoSell);
    console.log('  - hasAutoSell:', hasAutoSell);
  }

  const handleUpdate = async () => {
    try {
      const updatedCoupon = await getGifticonDetail(id);
      setCoupon(updatedCoupon);
    } catch (err: any) {
      console.error('기프티콘 조회 실패:', err);
    }
  };

  const handleEdit = () => {
    if (id) {
      (navigation as any).navigate('CouponModify', { id });
    }
  };

  return (
    <ContentLayout headerType="back" headerTitle="쿠폰 상세" onBack={handleBack}>
      <ScrollView>
        <Container>
          {/* 자동 판매 정보 카드 (자동 판매 설정이 있는 경우에만 표시) */}
          {hasAutoSell ? (
            <AutoSellInfoCard 
              daysLeft={daysLeftUntilAutoSell} 
              amount={autoSellAmount} 
            />
          ) : (
            __DEV__ && (
              <DebugContainer>
                <StyledText fontSize={12} color={COLORS.text.secondary}>
                  [DEBUG] 자동 판매 정보 없음{'\n'}
                  scheduledSaleDate: {coupon?.scheduledSaleDate || 'null'}{'\n'}
                  plannedSalePrice: {coupon?.plannedSalePrice || 'null'}{'\n'}
                  hasAutoSell: {String(hasAutoSell ?? false)}
                </StyledText>
              </DebugContainer>
            )
          )}

          <InfoDetailCard coupon={coupon} onEdit={handleEdit} />

          <ButtonGroup>
            <ActionButton
              variant="used"
              onPress={handleUse}
            >
              <StyledText fontSize={16} fontWeight={600} color={COLORS.white}>
                {coupon.status === 'USED' ? '사용 취소' : '사용 완료'}
              </StyledText>
            </ActionButton>
            {coupon.status !== 'USED' && 
             (!coupon.histories || coupon.histories.length === 0) && (
              <ActionButton
                variant="sell"
                onPress={handleSell}
              >
                <StyledText fontSize={16} fontWeight={600} color={COLORS.white}>
                  판매하기
                </StyledText>
              </ActionButton>
            )}
          </ButtonGroup>

          {/* 정액권 남은 금액 카드 (PREPAID 타입일 때만 표시) */}
          {coupon.gifticonType === 'PREPAID' && (
            <RemainMoneyCard 
              coupon={coupon} 
              gifticonId={id}
              onUpdate={handleUpdate}
            />
          )}
        </Container>
      </ScrollView>
    </ContentLayout>
  );
};

export default CouponDetail;
