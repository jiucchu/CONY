import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, BackHandler, Dimensions, Platform, PermissionsAndroid } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import ImagePicker from 'react-native-image-crop-picker';
import InfoModifyCard from '@/components/InfoModify/InfoModifyCard';
import { GifticonDetailResponseDto, GifticonRegisterRequestDto, GifticonType } from '@/types/gifticon/gifticon';
import { COLORS } from '@/constants/colors';
import { DefaultButton } from '@/components/common/atomic/Button';
import ContentLayout from '@/components/layout/ContentLayout';
import { showConfirm } from '@/utils/utils';
import { registerGifticons, registerGifticonsWithImage } from '@/api/gifticon/gifticonApi';
import { StyledText } from '@/utils/StyledText';
import { Svg, Line, Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.9; // 90% 너비
const CARD_SPACING = 30;
const SLIDE_WIDTH = CARD_WIDTH + CARD_SPACING;

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
  carouselContainer: {
    width: '100%',
    paddingVertical: 30,
  },
  carouselContent: {
    paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
  },
  cardWrapper: {
    position: 'relative',
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
    alignItems: 'center',
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
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 10,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  addButtonWrapper: {
    width: '100%',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    width: '60%',
    margin: 20,
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
  imageFile?: { uri: string; type?: string; name?: string }; // 실제 이미지 파일 정보 (원본)
  thumbnailFile?: { uri: string; type?: string; name?: string }; // 썸네일 이미지 파일 정보
  giftCardName: string;
  barcode: string;
  store: string;
  type: 'product' | 'amount';
  price: number;
  expirationDate: string;
}

const CouponCreate = () => {
  const navigation = useNavigation();
  const horizontalScrollRef = useRef<ScrollView>(null);
  const [coupons, setCoupons] = useState<CouponFormData[]>([{
    id: 'coupon-0',
    imageUrl: '',
    imageFile: undefined,
    giftCardName: '',
    barcode: '',
    store: '',
    type: 'product',
    price: 0,
    expirationDate: '',
  }]);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const requestImagePermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          {
            title: '이미지 접근 권한',
            message: '이미지를 선택하려면 갤러리 접근 권한이 필요합니다.',
            buttonNeutral: '나중에',
            buttonNegative: '취소',
            buttonPositive: '확인',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    // iOS는 react-native-image-picker가 자동으로 권한을 처리합니다.
    return true;
  };

  const handleImageSelect = async (couponId: string) => {
    try {
      // 권한 요청
      const hasPermission = await requestImagePermission();
      if (!hasPermission) {
        Alert.alert(
          '권한 필요',
          '이미지를 선택하려면 갤러리 접근 권한이 필요합니다.\n설정에서 권한을 허용해주세요.'
        );
        return;
      }

      // 이미지 선택 (원본은 전체, 썸네일만 크롭)
      try {
        // 원본 이미지 선택 (크롭 없이 전체 이미지)
        const originalImage = await ImagePicker.openPicker({
          width: 2000,
          height: 2000,
          cropping: false, // 원본은 크롭 없이 전체 이미지 사용
          compressImageQuality: 0.9,
          mediaType: 'photo',
        });

        const imageFile = {
          uri: originalImage.path,
          type: originalImage.mime || 'image/jpeg',
          name: originalImage.filename || `image_${Date.now()}.jpg`,
        };

        console.log('원본 이미지 선택 완료:', imageFile);

        // 썸네일 생성: 같은 이미지를 작은 크기로 크롭
        let thumbnailFile = undefined;
        try {
          const thumbnailImage = await ImagePicker.openCropper({
            path: originalImage.path,
            width: 400,
            height: 400,
            cropping: true,
            cropperToolbarTitle: '썸네일 영역 선택',
            compressImageQuality: 0.7,
            mediaType: 'photo',
          });

          thumbnailFile = {
            uri: thumbnailImage.path,
            type: thumbnailImage.mime || 'image/jpeg',
            name: `thumbnail_${originalImage.filename || `image_${Date.now()}.jpg`}`,
          };

          console.log('썸네일 이미지 크롭 완료:', thumbnailFile);
        } catch (cropError: any) {
          // 썸네일 크롭 실패 시 에러 처리
          const errorMessage = cropError?.message || cropError?.toString() || '알 수 없는 오류';
          const errorCode = cropError?.code || '';
          
          console.warn('썸네일 크롭 실패:', {
            message: errorMessage,
            code: errorCode,
            error: cropError
          });

          // 사용자가 취소한 경우가 아니면 경고 표시
          if (errorMessage !== 'User cancelled image selection' && 
              errorCode !== 'E_PICKER_CANCELLED' &&
              !errorMessage.includes('cancelled')) {
            Alert.alert(
              '썸네일 크롭 실패', 
              '썸네일 크롭에 실패했습니다. 원본 이미지만 저장됩니다.\n' + errorMessage
            );
          } else {
            console.log('사용자가 썸네일 크롭을 취소했습니다.');
          }
          // 썸네일이 없어도 원본 이미지는 저장되도록 계속 진행
        }

        // 원본 이미지는 항상 저장, 썸네일은 성공한 경우만 저장
        setCoupons(prevCoupons => 
          prevCoupons.map(coupon => 
            coupon.id === couponId 
              ? { 
                  ...coupon, 
                  imageUrl: originalImage.path, 
                  imageFile: imageFile,
                  thumbnailFile: thumbnailFile
                }
              : coupon
          )
        );
        
        console.log('이미지 업데이트 완료 (원본:', !!imageFile, ', 썸네일:', !!thumbnailFile, ')');
      } catch (error: any) {
        // 원본 이미지 선택 실패 시
        const errorMessage = error?.message || error?.toString() || '알 수 없는 오류';
        const errorCode = error?.code || '';
        
        console.error('이미지 선택 오류:', {
          message: errorMessage,
          code: errorCode,
          error: error
        });

        if (errorMessage !== 'User cancelled image selection' && 
            errorCode !== 'E_PICKER_CANCELLED' &&
            !errorMessage.includes('cancelled')) {
          Alert.alert('오류', `이미지 선택 중 오류가 발생했습니다: ${errorMessage}`);
        } else {
          console.log('사용자가 이미지 선택을 취소했습니다.');
        }
      }
    } catch (error) {
      console.error('이미지 선택 오류:', error);
      Alert.alert('오류', '이미지 선택 중 오류가 발생했습니다.');
    }
  };

  const handleAddCoupon = () => {
    const newCoupon: CouponFormData = {
      id: `coupon-${Date.now()}`,
      imageUrl: '',
      imageFile: undefined,
      giftCardName: '',
      barcode: '',
      store: '',
      type: 'product',
      price: 0,
      expirationDate: '',
    };
    const newCoupons = [...coupons, newCoupon];
    const newIndex = newCoupons.length - 1;
    setCoupons(newCoupons);
    // 새로 추가된 카드로 이동
    setTimeout(() => {
      horizontalScrollRef.current?.scrollTo({
        x: newIndex * SLIDE_WIDTH,
        animated: true,
      });
      setCurrentIndex(newIndex);
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
            // 삭제 후 첫 번째 카드로 이동
            setTimeout(() => {
              horizontalScrollRef.current?.scrollTo({
                x: 0,
                animated: true,
              });
              setCurrentIndex(0);
            }, 100);
          },
        },
      ]
    );
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SLIDE_WIDTH);
    setCurrentIndex(index);
  };

  const updateCoupon = (id: string, field: keyof CouponFormData, value: any) => {
    setCoupons(prevCoupons => 
      prevCoupons.map(coupon => 
        coupon.id === id ? { ...coupon, [field]: value } : coupon
      )
    );
  };

  const handleRegister = async () => {
    // 필수 필드 검증
    const invalidCoupons = coupons.filter(coupon => 
      !coupon.giftCardName || !coupon.barcode || !coupon.store || !coupon.expirationDate || coupon.price <= 0
    );

    if (invalidCoupons.length > 0) {
      Alert.alert('오류', '모든 필수 항목을 입력해주세요. (가격은 0보다 커야 합니다)');
      return;
    }

    // 날짜 검증 (과거 날짜 체크)
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
      // API 형식에 맞게 변환
      const registerData: GifticonRegisterRequestDto[] = coupons.map(coupon => {
        // 날짜 형식 변환 (YYYY/MM/DD -> YYYY-MM-DD 또는 그대로)
        let formattedDate = coupon.expirationDate;
        if (formattedDate.includes('/')) {
          formattedDate = formattedDate.replace(/\//g, '-');
        }
        // YYYY-MM-DD 형식 확인
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
          // multipart 요청일 때는 imageUrl을 빈 문자열로 보냄 (실제 파일은 별도로 전송)
          imageUrl: hasImageFile ? '' : (coupon.imageUrl || ''),
          // categoryName은 optional이므로 빈 문자열이나 undefined로 전송
          // 백엔드에서 브랜드명으로 카테고리를 자동으로 찾아주므로 생략 가능
        };
      });

      console.log('등록할 데이터:', JSON.stringify(registerData, null, 2));
      
      // 이미지 파일이 있는 경우 multipart로 전송, 없으면 JSON으로 전송
      const hasImageFile = coupons.some(coupon => coupon.imageFile);
      console.log('이미지 파일 존재 여부:', hasImageFile);
      
      if (hasImageFile) {
        // 첫 번째 쿠폰의 이미지 파일 사용 (여러 쿠폰 등록 시 첫 번째 이미지만 사용)
        const firstCoupon = coupons.find(coupon => coupon.imageFile);
        const firstImageFile = firstCoupon?.imageFile;
        const firstThumbnailFile = firstCoupon?.thumbnailFile;
        console.log('첫 번째 이미지 파일:', firstImageFile);
        console.log('첫 번째 썸네일 파일:', firstThumbnailFile);
        if (firstImageFile) {
          console.log('Multipart 방식으로 등록 시도 (원본 + 썸네일)');
          await registerGifticonsWithImage(registerData, firstImageFile, firstThumbnailFile);
        } else {
          console.log('이미지 파일이 없어 JSON 방식으로 등록');
          await registerGifticons(registerData);
        }
      } else {
        console.log('JSON 방식으로 등록');
        await registerGifticons(registerData);
      }
      
      Alert.alert('성공', '쿠폰이 성공적으로 등록되었습니다.');
      if ((navigation as any).canGoBack()) {
        (navigation as any).goBack();
      }
    } catch (error: any) {
      console.error('쿠폰 등록 실패:', error);
      const errorMessage = error?.message || '쿠폰 등록에 실패했습니다.';
      Alert.alert('오류', errorMessage);
    }
  };

  return (
    <ContentLayout headerType="back" headerTitle="쿠폰 등록" onBack={handleBackWithAlert}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Pagination */}
          {coupons.length > 1 && (
            <View style={styles.pagination}>
              {coupons.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    {
                      backgroundColor: index === currentIndex ? COLORS.primary : COLORS.text.secondary,
                    },
                  ]}
                />
              ))}
            </View>
          )}

          {/* Horizontal Carousel */}
          <ScrollView
            ref={horizontalScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={SLIDE_WIDTH}
            decelerationRate="fast"
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.carouselContent}
            style={styles.carouselContainer}
          >
            {coupons.map((coupon) => (
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
                  onImageEdit={() => handleImageSelect(coupon.id)}
                  onGiftCardNameChange={(value) => updateCoupon(coupon.id, 'giftCardName', value)}
                  onBarcodeChange={(value) => updateCoupon(coupon.id, 'barcode', value)}
                  onStoreChange={(value) => updateCoupon(coupon.id, 'store', value)}
                  onTypeChange={(type) => updateCoupon(coupon.id, 'type', type)}
                  onPriceChange={(value) => updateCoupon(coupon.id, 'price', value)}
                  onExpirationDateChange={(value) => updateCoupon(coupon.id, 'expirationDate', value)}
                />
              </View>
            ))}
          </ScrollView>

          {/* Add Button */}
          <View style={styles.addButtonWrapper}>
            <TouchableOpacity style={styles.addButton} onPress={handleAddCoupon}>
              <StyledText fontSize={14} fontWeight={600} color={COLORS.background.gray}>
                쿠폰 더 등록하기
              </StyledText>
            </TouchableOpacity>
          </View>

          {/* Register Button */}
          <View style={styles.buttonContainer}>
            <DefaultButton onPress={handleRegister}>쿠폰 등록</DefaultButton>
          </View>
        </View>
      </ScrollView>
    </ContentLayout>
  );
};

export default CouponCreate;
