import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert, BackHandler, Platform, PermissionsAndroid } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import ContentLayout from '@/components/layout/ContentLayout';
import InfoModifyCard from '@/components/InfoModify/InfoModifyCard';
import { DefaultButton } from '@/components/common/atomic/Button';
import { GifticonDetailResponseDto, GifticonUpdateRequestDto } from '@/types/gifticon/gifticon';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';
import { getGifticonDetail, updateGifticonInfo } from '@/api/gifticon/gifticonApi';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    padding: 20,
    gap: 24,
  },
  buttonContainer: {
    width: '60%',
    marginVertical: 20,
    marginBottom: 60,
    alignSelf: 'center',
  },
});

const CouponModify = () => {
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
      try {
        setLoading(true);
        const data = await getGifticonDetail(id);
        setCoupon(data);
        setError(null);
      } catch (err) {
        console.error('기프티콘 조회 실패:', err);
        setError('기프티콘을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCoupon();
    }
  }, [id]);

  const initialFormData = useMemo(() => {
    if (!coupon) {
      return {
        imageUrl: '',
        giftCardName: '',
        barcode: '',
        store: '',
        categoryName: '',
        type: 'amount' as 'product' | 'amount',
        price: 0,
        expirationDate: '',
      };
    }
    return {
      imageUrl: coupon.imageUrl || '',
      giftCardName: coupon.productName || '',
      barcode: coupon.barcodeNumber || '',
      store: coupon.brandName || '',
      categoryName: coupon.categoryName || '',
      type: (coupon.gifticonType === 'PREPAID' ? 'amount' : 'product') as 'product' | 'amount',
      price: coupon.originalPrice || 0,
      expirationDate: coupon.expiryDate || '',
    };
  }, [coupon]);

  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState<{ uri: string; type?: string; name?: string } | undefined>(undefined);

  useEffect(() => {
    if (coupon) {
      setFormData({
        imageUrl: coupon.imageUrl || '',
        giftCardName: coupon.productName || '',
        barcode: coupon.barcodeNumber || '',
        store: coupon.brandName || '',
        categoryName: coupon.categoryName || '',
        type: (coupon.gifticonType === 'PREPAID' ? 'amount' : 'product') as 'product' | 'amount',
        price: coupon.originalPrice || 0,
        expirationDate: coupon.expiryDate || '',
      });
    }
  }, [coupon]);

  const requestImagePermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const androidVersion = Platform.Version;
        let permission: string;
        
        if (androidVersion >= 33) {
          permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
        } else {
          permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
        }

        const checkResult = await PermissionsAndroid.check(permission);
        if (checkResult) {
          return true;
        }

        const granted = await PermissionsAndroid.request(
          permission,
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
        console.warn('권한 요청 오류:', err);
        return false;
      }
    }
    // iOS는 react-native-image-picker가 자동으로 권한을 처리합니다.
    return true;
  };

  if (loading) {
    return (
      <ContentLayout headerType="back" headerTitle="쿠폰 수정" onBack={handleBack}>
        <View style={styles.container}>
          <StyledText fontSize={18} fontWeight={600} color={COLORS.text.secondary}>
            로딩 중...
          </StyledText>
        </View>
      </ContentLayout>
    );
  }

  if (error || !coupon) {
    return (
      <ContentLayout headerType="back" headerTitle="쿠폰 수정" onBack={handleBack}>
        <View style={styles.container}>
          <StyledText fontSize={18} fontWeight={600} color={COLORS.text.secondary}>
            {error || '쿠폰을 찾을 수 없습니다.'}
          </StyledText>
        </View>
      </ContentLayout>
    );
  }

  const handleImageEdit = async () => {
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

      // 이미지 라이브러리 열기
      launchImageLibrary(
        {
          mediaType: 'photo' as MediaType,
          includeBase64: false,
          maxHeight: 2000,
          maxWidth: 2000,
          quality: 0.8,
          selectionLimit: 1, // 1개만 선택
        },
        (response: ImagePickerResponse) => {
          if (response.didCancel) {
            console.log('사용자가 이미지 선택을 취소했습니다.');
          } else if (response.errorCode) {
            console.error('ImagePicker Error: ', response.errorCode, response.errorMessage);
            Alert.alert('오류', `이미지 선택 중 오류가 발생했습니다: ${response.errorMessage}`);
          } else if (response.assets && response.assets.length > 0) {
            const asset = response.assets[0];
            if (asset.uri) {
              const selectedImageFile = {
                uri: asset.uri,
                type: asset.type || 'image/jpeg',
                name: asset.fileName || `image_${Date.now()}.jpg`,
              };
              
              // formData와 imageFile 업데이트
              setFormData(prev => ({
                ...prev,
                imageUrl: asset.uri,
              }));
              setImageFile(selectedImageFile);
              
              console.log('이미지 선택 완료:', selectedImageFile);
            } else {
              console.warn('이미지 URI가 없습니다.');
            }
          } else {
            console.warn('선택된 이미지가 없습니다.');
          }
        }
      );
    } catch (error) {
      console.error('이미지 선택 오류:', error);
      Alert.alert('오류', '이미지 선택 중 오류가 발생했습니다.');
    }
  };

  const handleSubmit = async () => {
    if (!formData.giftCardName.trim() || !formData.store.trim() || !formData.expirationDate || formData.price <= 0) {
      Alert.alert('오류', '모든 필수 항목을 입력해주세요. (가격은 0보다 커야 합니다)');
      return;
    }

    let formattedDate = formData.expirationDate;
    if (formattedDate.includes('/')) {
      formattedDate = formattedDate.replace(/\//g, '-');
    }
    
    if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
      Alert.alert('오류', '날짜 형식이 올바르지 않습니다. (YYYY-MM-DD 형식이어야 합니다)');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(formattedDate);
    expiryDate.setHours(0, 0, 0, 0);
    
    if (expiryDate < today) {
      Alert.alert('오류', '유효기간은 오늘 이후 날짜여야 합니다.');
      return;
    }

    try {
      const updateData: GifticonUpdateRequestDto = {
        productName: formData.giftCardName.trim(),
        brandName: formData.store.trim(),
        categoryName: formData.categoryName?.trim() || undefined,
        originalPrice: formData.price,
        expiryDate: formattedDate,
      };
      
      await updateGifticonInfo(id, updateData);
      Alert.alert('성공', '쿠폰이 성공적으로 수정되었습니다.');
      handleBack();
    } catch (err: any) {
      console.error('기프티콘 수정 실패:', err);
      Alert.alert('오류', `기프티콘 수정에 실패했습니다. ${err.message || '서버 오류가 발생했습니다.'}`);
    }
  };

  return (
    <ContentLayout headerType="back" headerTitle="쿠폰 수정" onBack={handleBack}>
      <ScrollView>
        <View style={styles.container}>
          <InfoModifyCard
            imageUrl={formData.imageUrl}
            giftCardName={formData.giftCardName}
            barcode={formData.barcode}
            store={formData.store}
            categoryName={formData.categoryName}
            type={formData.type}
            price={formData.price}
            expirationDate={formData.expirationDate}
            onImageEdit={handleImageEdit}
            onGiftCardNameChange={(value) => setFormData({ ...formData, giftCardName: value })}
            onBarcodeChange={(value) => setFormData({ ...formData, barcode: value })}
            onStoreChange={(value) => setFormData({ ...formData, store: value })}
            onCategoryNameChange={(value) => setFormData({ ...formData, categoryName: value })}
            onTypeChange={(type) => setFormData({ ...formData, type })}
            onPriceChange={(value) => setFormData({ ...formData, price: value })}
            onExpirationDateChange={(value) => setFormData({ ...formData, expirationDate: value })}
          />
        </View>
        <View style={styles.buttonContainer}>
          <DefaultButton onPress={handleSubmit}>수정 완료</DefaultButton>
        </View>
      </ScrollView>
    </ContentLayout>
  );
};

export default CouponModify;
