import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import InfoModifyCard from '@/components/InfoModify/InfoModifyCard';
import { GifticonDetailResponseDto, GifticonRegisterRequestDto, GifticonType } from '@/types/gifticon/gifticon';
import { COLORS } from '@/constants/colors';
import { DefaultButton } from '@/components/common/atomic/Button';
import ContentLayout from '@/components/layout/ContentLayout';
import { showConfirm } from '@/utils/utils';
import { registerGifticons } from '@/api/gifticon/gifticonApi';
import { StyledText } from '@/utils/StyledText';
import { Svg, Line } from 'react-native-svg';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingBottom: 32,
    paddingTop: 20,
    minHeight: 450,
    position: 'relative',
  },
  addButtonWrapper: {
    width: '100%',
    marginBottom: 16,
    alignItems: 'center',
  },
  addButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    position: 'relative',
    width: '100%',
    marginTop: 20,
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: '8%',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonContainer: {
    width: '60%',
    marginVertical: 20,
    marginBottom: 60,
  },
});

const CloseIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={COLORS.text.primary} strokeWidth={2.5}>
    <Line x1="18" y1="6" x2="6" y2="18" />
    <Line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
);

interface CouponFormData {
  id: string;
  imageUrl: string;
  giftCardName: string;
  barcode: string;
  store: string;
  type: 'product' | 'amount';
  price: number;
  expirationDate: string;
}

const CouponCreate = () => {
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const [coupons, setCoupons] = useState<CouponFormData[]>([{
    id: 'coupon-0',
    imageUrl: '',
    giftCardName: '',
    barcode: '',
    store: '',
    type: 'product',
    price: 0,
    expirationDate: '',
  }]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBackWithAlert();
      return true; // 이벤트 소비
    });

    return () => backHandler.remove();
  }, [navigation]);

  const handleBack = () => {
    if ((navigation as any).canGoBack()) {
      (navigation as any).goBack();
    }
  };

  const handleBackWithAlert = () => {
    showConfirm('페이지에서 나갈 시 작성한 내용이 저장되지 않습니다.', [
      {
        text: '취소',
        style: 'cancel',
        onPress: () => {
          // 취소 시 아무것도 하지 않음
        }
      },
      {
        text: '확인',
        style: 'destructive',
        onPress: () => {
          handleBack();
        }
      },
    ]);
  };

  const handleAddCoupon = () => {
    const newCoupon: CouponFormData = {
      id: `coupon-${Date.now()}`,
      imageUrl: '',
      giftCardName: '',
      barcode: '',
      store: '',
      type: 'product',
      price: 0,
      expirationDate: '',
    };
    setCoupons([...coupons, newCoupon]);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 300);
  };

  const handleDeleteCoupon = (id: string) => {
    if (coupons.length <= 1) {
      Alert.alert('알림', '최소 하나의 쿠폰 카드는 필요합니다.');
      return;
    }
    
    Alert.alert(
      '삭제 확인',
      '이 쿠폰 카드를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            const newCoupons = coupons.filter(coupon => coupon.id !== id);
            setCoupons(newCoupons);
          },
        },
      ]
    );
  };

  const updateCoupon = (id: string, field: keyof CouponFormData, value: any) => {
    setCoupons(coupons.map(coupon => 
      coupon.id === id ? { ...coupon, [field]: value } : coupon
    ));
  };

  const handleRegister = async () => {
    const invalidCoupons = coupons.filter(coupon => 
      !coupon.giftCardName || !coupon.barcode || !coupon.store || !coupon.expirationDate || coupon.price <= 0
    );

    if (invalidCoupons.length > 0) {
      Alert.alert('오류', '모든 필수 항목을 입력해주세요. (가격은 0보다 커야 합니다)');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const invalidDateCoupons = coupons.filter(coupon => {
      if (!coupon.expirationDate) return true;
      let dateStr = coupon.expirationDate;
      if (dateStr.includes('/')) {
        dateStr = dateStr.replace(/\//g, '-');
      }
      const expiryDate = new Date(dateStr);
      expiryDate.setHours(0, 0, 0, 0);
      return expiryDate < today;
    });

    if (invalidDateCoupons.length > 0) {
      Alert.alert('오류', '유효기간은 오늘 이후 날짜여야 합니다.');
      return;
    }

    try {
      const registerData: GifticonRegisterRequestDto[] = coupons.map(coupon => {
        let formattedDate = coupon.expirationDate;
        if (formattedDate.includes('/')) {
          formattedDate = formattedDate.replace(/\//g, '-');
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
          throw new Error(`날짜 형식이 올바르지 않습니다: ${formattedDate}`);
        }

        return {
          brandName: coupon.store.trim(),
          productName: coupon.giftCardName.trim(),
          barcodeNumber: coupon.barcode.trim(),
          expiryDate: formattedDate,
          originalPrice: coupon.price,
          type: (coupon.type === 'amount' ? 'PREPAID' : 'PRODUCT') as GifticonType,
          imageUrl: coupon.imageUrl || '',
        };
      });

      await registerGifticons(registerData);
      Alert.alert('성공', '쿠폰이 성공적으로 등록되었습니다.');
      goBack();
    } catch (err: any) {
      console.error('쿠폰 등록 실패:', err);
      Alert.alert('오류', `쿠폰 등록에 실패했습니다. ${err.message || '서버 오류가 발생했습니다.'}`);
    }
  };

  return (
    <ContentLayout headerType="back" headerTitle="쿠폰 등록" onBack={handleBackWithAlert}>
      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.addButtonWrapper}>
            <TouchableOpacity style={styles.addButton} onPress={handleAddCoupon}>
              <StyledText fontSize={16} fontWeight={600} color={COLORS.white}>
                쿠폰 더 등록하기
              </StyledText>
            </TouchableOpacity>
          </View>

          {coupons.map((coupon, index) => (
            <View key={coupon.id} style={styles.cardWrapper}>
              {coupons.length > 1 && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteCoupon(coupon.id)}
                >
                  <CloseIcon />
                </TouchableOpacity>
              )}
              <InfoModifyCard
                imageUrl={coupon.imageUrl}
                giftCardName={coupon.giftCardName}
                barcode={coupon.barcode}
                store={coupon.store}
                type={coupon.type}
                price={coupon.price}
                expirationDate={coupon.expirationDate}
                onGiftCardNameChange={(value) => updateCoupon(coupon.id, 'giftCardName', value)}
                onBarcodeChange={(value) => updateCoupon(coupon.id, 'barcode', value)}
                onStoreChange={(value) => updateCoupon(coupon.id, 'store', value)}
                onTypeChange={(type) => updateCoupon(coupon.id, 'type', type)}
                onPriceChange={(value) => updateCoupon(coupon.id, 'price', value)}
                onExpirationDateChange={(value) => updateCoupon(coupon.id, 'expirationDate', value)}
              />
            </View>
          ))}
        </View>
        <View style={styles.buttonContainer}>
          <DefaultButton onPress={handleRegister}>등록 완료</DefaultButton>
        </View>
      </ScrollView>
    </ContentLayout>
  );
};

export default CouponCreate;
