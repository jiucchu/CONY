import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { GifticonDetailResponseDto } from '@/types/gifticon/gifticon';
import DdayView from '@/components/common/card/atomic/DdayView';
import { COLORS } from '@/constants/colors';
import { calculateDaysUntilExpiration } from '@/utils/DayUtils';
import { StyledText } from '@/utils/StyledText';
import { Svg, Path, Line } from 'react-native-svg';
import BarcodeView from '@/components/common/barcode/BarcodeView';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: '90%',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    position: 'relative',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1.4,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#E5E5E5',
  },
  productImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E5E5',
    borderRadius: 10,
    resizeMode: 'cover',
  },
  ddayWrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
  },
  actionButtonsWrapper: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 20,
  },
  actionButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: COLORS.background.lightGray,
    borderRadius: 16,
  },
  infoContainer: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  barcodeContainer: {
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  barcodeWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  barcodeText: {
    marginTop: 12,
  },
});

const EditIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={COLORS.text.primary} strokeWidth={2}>
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Svg>
);

const DeleteIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={COLORS.text.primary} strokeWidth={2}>
    <Line x1="3" y1="6" x2="21" y2="6" />
    <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <Line x1="10" y1="11" x2="10" y2="17" />
    <Line x1="14" y1="11" x2="14" y2="17" />
  </Svg>
);

const formatExpirationDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `~${year}. ${month}. ${day} 까지`;
};

const formatBarcodeNumber = (barcode: string): string => {
  const cleaned = barcode.replace(/\s/g, '');
  const parts = [];
  for (let i = 0; i < cleaned.length; i += 4) {
    parts.push(cleaned.slice(i, i + 4));
  }
  return parts.join(' ');
};

interface InfoDetailCardProps {
  coupon: GifticonDetailResponseDto;
  barcodeNumber?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

const InfoDetailCard = ({ coupon, barcodeNumber, onEdit, onDelete }: InfoDetailCardProps) => {
  const daysUntilExpiration = calculateDaysUntilExpiration(coupon.expiryDate);
  const formattedExpiration = formatExpirationDate(coupon.expiryDate);
  const defaultBarcode = barcodeNumber || String(coupon.gifticonId).padStart(16, '0');
  const formattedBarcode = formatBarcodeNumber(defaultBarcode);

  const handleDelete = () => {
    Alert.alert(
      '삭제 확인',
      '정말 이 기프티콘을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.actionButtonsWrapper}>
        {onEdit && (
          <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
            <EditIcon />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
            <DeleteIcon />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.imageContainer}>
        <View style={styles.ddayWrapper}>
          <DdayView type="gift" dday={daysUntilExpiration} size="Medium" />
        </View>
        <Image source={{ uri: coupon.imageUrl }} style={styles.productImage} />
      </View>
      <View style={styles.infoContainer}>
        <View style={{ marginBottom: 5 }}>
          <StyledText fontSize={16} fontWeight={600} color={COLORS.text.secondary}>
            {coupon.brandName}
          </StyledText>
        </View>
        <StyledText fontSize={20} fontWeight={800} color={COLORS.text.primary}>
          {coupon.productName}
        </StyledText>
        <StyledText fontSize={16} fontWeight={400} color={COLORS.text.primary}>
          {formattedExpiration}
        </StyledText>
      </View>
      <View style={styles.barcodeContainer}>
        <View style={styles.barcodeWrapper}>
          <BarcodeView 
            value={formattedBarcode} 
            width={280}
            height={80}
            format="CODE128"
          />
        </View>
        <StyledText style={styles.barcodeText} fontSize={15} fontWeight={400} color={COLORS.text.primary}>
          {formattedBarcode}
        </StyledText>
      </View>
    </View>
  );
};

export default InfoDetailCard;
