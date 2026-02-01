import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';
import SwitchToggle from '@/components/common/atomic/SwitchToggle';
import DatePicker from '@/components/common/atomic/DatePicker';

const styles = StyleSheet.create({
  container: {
    gap: 20,
    width: '100%',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
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
});

interface AutoSellInfoProps {
  isAutoSellEnabled?: boolean;
  saleDate?: string;
  saleAmount?: number;
  onAutoSellToggle?: (enabled: boolean) => void;
  onSaleDateChange?: (date: string) => void;
  onSaleAmountChange?: (amount: number) => void;
}

const AutoSellInfo = ({
  isAutoSellEnabled: propIsAutoSellEnabled = false,
  saleDate = '',
  saleAmount = 0,
  onAutoSellToggle,
  onSaleDateChange,
  onSaleAmountChange,
}: AutoSellInfoProps) => {
  const [isAutoSellEnabled, setIsAutoSellEnabled] = useState(propIsAutoSellEnabled);
  const [localSaleDate, setLocalSaleDate] = useState(saleDate);
  const [localSaleAmount, setLocalSaleAmount] = useState(saleAmount.toString());

  useEffect(() => {
    setIsAutoSellEnabled(propIsAutoSellEnabled);
  }, [propIsAutoSellEnabled]);

  useEffect(() => {
    setLocalSaleDate(saleDate);
  }, [saleDate]);

  useEffect(() => {
    setLocalSaleAmount(saleAmount.toString());
  }, [saleAmount]);

  const handleToggle = () => {
    const newValue = !isAutoSellEnabled;
    setIsAutoSellEnabled(newValue);
    onAutoSellToggle?.(newValue);
  };

  const handleDateChange = (date: string) => {
    // DatePicker는 YYYY-MM-DD 형식으로 반환하므로 YYYY/MM/DD로 변환
    const formattedDate = date.replace(/-/g, '/');
    setLocalSaleDate(formattedDate);
    onSaleDateChange?.(formattedDate);
  };

  const handleAmountChange = (text: string) => {
    const value = text.replace(/[^0-9]/g, '');
    const numValue = parseInt(value) || 0;
    setLocalSaleAmount(value);
    onSaleAmountChange?.(numValue);
  };

  const formatAmount = (value: string) => {
    const numValue = value.replace(/[^0-9]/g, '');
    return numValue ? parseInt(numValue).toLocaleString('ko-KR') : '';
  };

  return (
    <View style={styles.container}>
      <View style={styles.fieldRow}>
        <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
          자동 판매 등록
        </StyledText>
        <SwitchToggle
          isOn={isAutoSellEnabled}
          onPress={handleToggle}
          ariaLabel="자동 판매 등록"
        />
      </View>

      {isAutoSellEnabled && (
        <>
          <View style={styles.formField}>
            <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
              판매일자
            </StyledText>
            <DatePicker
              value={localSaleDate.replace(/\//g, '-')}
              onChange={handleDateChange}
              minimumDate={new Date()}
              placeholder="판매일자를 선택하세요"
            />
          </View>

          <View style={styles.formField}>
            <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
              판매금액
            </StyledText>
            <TextInput
              style={styles.input}
              value={formatAmount(localSaleAmount)}
              onChangeText={handleAmountChange}
              placeholder="판매금액을 입력하세요"
              keyboardType="numeric"
              placeholderTextColor={COLORS.text.secondary}
            />
          </View>
        </>
      )}
    </View>
  );
};

export default AutoSellInfo;
