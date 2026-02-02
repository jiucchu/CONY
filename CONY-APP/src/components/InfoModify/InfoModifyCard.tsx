import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';
import AutoSellInfo from './atomic/AutoSellInfo';
import FolderSelector from './FolderSelector';
import { FolderData } from '@/types/coupon/coupon';
import DatePicker from '@/components/common/atomic/DatePicker';
import { Svg, Path } from 'react-native-svg';

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    width: '80%',
    maxWidth: 500,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
    gap: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  imageSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCard: {
    width: 180,
    height: 180,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.background.lightGray,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  editButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  formSection: {
    gap: 20,
  },
  formField: {
    width: '100%',
    gap: 8,
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.background.lightGray,
    borderRadius: 8,
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.text.primary,
    backgroundColor: COLORS.white,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: (isSelected: boolean) => ({
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: isSelected ? COLORS.primary : COLORS.background.lightGray,
    borderRadius: 8,
    backgroundColor: isSelected ? COLORS.primary : COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  }),
});

const EditIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={COLORS.text.primary} strokeWidth={2}>
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Svg>
);

interface InfoModifyCardProps {
  imageUrl?: string;
  giftCardName?: string;
  barcode?: string;
  store?: string;
  categoryName?: string;
  type?: 'product' | 'amount';
  price?: number;
  expirationDate?: string;
  // 자동 판매 설정
  isAutoSellEnabled?: boolean;
  scheduledSaleDate?: string;
  plannedSalePrice?: number;
  onImageEdit?: () => void;
  onGiftCardNameChange?: (value: string) => void;
  onBarcodeChange?: (value: string) => void;
  onStoreChange?: (value: string) => void;
  onCategoryNameChange?: (value: string) => void;
  onTypeChange?: (type: 'product' | 'amount') => void;
  onPriceChange?: (value: number) => void;
  onExpirationDateChange?: (value: string) => void;
  onAutoSellToggle?: (enabled: boolean) => void;
  onSaleDateChange?: (date: string) => void;
  onSaleAmountChange?: (amount: number) => void;
}

const InfoModifyCard = ({
  imageUrl = '',
  giftCardName = '',
  barcode = '',
  store = '',
  categoryName = '',
  type = 'product',
  price = 0,
  expirationDate = '',
  isAutoSellEnabled = false,
  scheduledSaleDate = '',
  plannedSalePrice = 0,
  onImageEdit,
  onGiftCardNameChange,
  onBarcodeChange,
  onStoreChange,
  onCategoryNameChange,
  onTypeChange,
  onPriceChange,
  onExpirationDateChange,
  onAutoSellToggle,
  onSaleDateChange,
  onSaleAmountChange,
}: InfoModifyCardProps) => {
  const [localImageUrl, setLocalImageUrl] = useState(imageUrl);
  const [localGiftCardName, setLocalGiftCardName] = useState(giftCardName);
  const [localBarcode, setLocalBarcode] = useState(barcode);
  const [localStore, setLocalStore] = useState(store);
  const [localCategoryName, setLocalCategoryName] = useState(categoryName);
  const [localType, setLocalType] = useState<'product' | 'amount'>(type);
  const [localPrice, setLocalPrice] = useState(price.toString());
  const [localExpirationDate, setLocalExpirationDate] = useState(expirationDate);

  useEffect(() => {
    setLocalImageUrl(imageUrl);
  }, [imageUrl]);

  useEffect(() => {
    setLocalGiftCardName(giftCardName);
  }, [giftCardName]);

  useEffect(() => {
    setLocalBarcode(barcode);
  }, [barcode]);

  useEffect(() => {
    setLocalStore(store);
  }, [store]);

  useEffect(() => {
    setLocalCategoryName(categoryName);
  }, [categoryName]);

  useEffect(() => {
    setLocalType(type);
  }, [type]);

  useEffect(() => {
    setLocalPrice(price.toString());
  }, [price]);

  useEffect(() => {
    setLocalExpirationDate(expirationDate);
  }, [expirationDate]);

  const handleGiftCardNameChange = (text: string) => {
    setLocalGiftCardName(text);
    onGiftCardNameChange?.(text);
  };

  const handleBarcodeChange = (text: string) => {
    setLocalBarcode(text);
    onBarcodeChange?.(text);
  };

  const handleStoreChange = (text: string) => {
    setLocalStore(text);
    onStoreChange?.(text);
  };

  const handleCategoryNameChange = (text: string) => {
    setLocalCategoryName(text);
    onCategoryNameChange?.(text);
  };

  const handleTypeChange = (newType: 'product' | 'amount') => {
    setLocalType(newType);
    onTypeChange?.(newType);
  };

  const handlePriceChange = (text: string) => {
    const value = text.replace(/[^0-9]/g, '');
    setLocalPrice(value);
    onPriceChange?.(parseInt(value) || 0);
  };

  const handleExpirationDateChange = (text: string) => {
    setLocalExpirationDate(text);
    onExpirationDateChange?.(text);
  };

  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    if (dateString.includes('/')) {
      return dateString.replace(/\//g, '-');
    }
    return dateString;
  };

  const formatPrice = (value: string) => {
    const numValue = value.replace(/[^0-9]/g, '');
    return numValue ? parseInt(numValue).toLocaleString('ko-KR') : '';
  };

  const handleFolderSelect = (folderId: string) => {
    console.log(folderId);
  };

  const folders: FolderData[] = [
    { id: '1', title: '폴더1', type: 'selected' },
    { id: '2', title: '폴더2', type: 'selected' },
    { id: '3', title: '폴더3', type: 'selected' },
  ];
  const selectedFolderId = '1';

  return (
    <View style={styles.container}>
      <View style={styles.imageSection}>
        <View style={styles.imageCard}>
          {localImageUrl ? (
            <Image source={{ uri: localImageUrl }} style={styles.productImage} />
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <StyledText fontSize={12} fontWeight={400} color={COLORS.text.secondary}>
                이미지 없음
              </StyledText>
            </View>
          )}
          <TouchableOpacity style={styles.editButton} onPress={onImageEdit}>
            <EditIcon />
          </TouchableOpacity>
        </View>
      </View>
      <FolderSelector folders={folders} selectedFolderId={selectedFolderId} onSelect={handleFolderSelect} />
      <View style={styles.formSection}>
        <View style={styles.formField}>
          <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
            기프티콘 명
          </StyledText>
          <TextInput
            style={styles.input}
            value={localGiftCardName}
            onChangeText={handleGiftCardNameChange}
            placeholder="기프티콘 명을 입력하세요"
            placeholderTextColor={COLORS.text.secondary}
          />
        </View>

        <View style={styles.formField}>
          <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
            바코드
          </StyledText>
          <TextInput
            style={styles.input}
            value={localBarcode}
            onChangeText={handleBarcodeChange}
            placeholder="바코드를 입력하세요"
            placeholderTextColor={COLORS.text.secondary}
          />
        </View>

        <View style={styles.formField}>
          <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
            사용처
          </StyledText>
          <TextInput
            style={styles.input}
            value={localStore}
            onChangeText={handleStoreChange}
            placeholder="사용처를 입력하세요"
            placeholderTextColor={COLORS.text.secondary}
          />
        </View>

        <View style={styles.formField}>
          <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
            카테고리
          </StyledText>
          <TextInput
            style={styles.input}
            value={localCategoryName}
            onChangeText={handleCategoryNameChange}
            placeholder="카테고리를 입력하세요 (예: 카페, 음식점 등)"
            placeholderTextColor={COLORS.text.secondary}
          />
        </View>

        <View style={styles.formField}>
          <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
            권종
          </StyledText>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.typeButton(localType === 'product')}
              onPress={() => handleTypeChange('product')}
            >
              <StyledText
                fontSize={14}
                fontWeight={600}
                color={localType === 'product' ? COLORS.white : COLORS.text.primary}
              >
                물품 교환형
              </StyledText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.typeButton(localType === 'amount')}
              onPress={() => handleTypeChange('amount')}
            >
              <StyledText
                fontSize={14}
                fontWeight={600}
                color={localType === 'amount' ? COLORS.white : COLORS.text.primary}
              >
                금액형
              </StyledText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formField}>
          <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
            가격
          </StyledText>
          <TextInput
            style={styles.input}
            value={formatPrice(localPrice)}
            onChangeText={handlePriceChange}
            placeholder="가격을 입력하세요"
            keyboardType="numeric"
            placeholderTextColor={COLORS.text.secondary}
          />
        </View>

        <View style={styles.formField}>
          <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
            유효기간
          </StyledText>
          <DatePicker
            value={formatDateForInput(localExpirationDate)}
            onChange={handleExpirationDateChange}
            minimumDate={new Date()}
            placeholder="날짜를 선택하세요"
          />
        </View>

        <AutoSellInfo
          isAutoSellEnabled={isAutoSellEnabled}
          saleDate={scheduledSaleDate}
          saleAmount={plannedSalePrice}
          onAutoSellToggle={onAutoSellToggle}
          onSaleDateChange={onSaleDateChange}
          onSaleAmountChange={onSaleAmountChange}
        />
      </View>
    </View>
  );
};

export default InfoModifyCard;
