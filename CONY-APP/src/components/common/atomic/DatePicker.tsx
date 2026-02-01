import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
// @ts-ignore - @react-native-community/datetimepicker 타입 정의가 없을 수 있음
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';

interface DatePickerProps {
  value: string; // YYYY-MM-DD or YYYY/MM/DD format
  onChange: (date: string) => void;
  minimumDate?: Date;
  placeholder?: string;
}

const DatePicker = ({
  value,
  onChange,
  minimumDate,
  placeholder = '날짜를 선택하세요',
}: DatePickerProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (value) {
      const dateStr = value.replace(/\//g, '-');
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? new Date() : date;
    }
    return new Date();
  });

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return '';
    return dateString.replace(/-/g, '/');
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'set' && date) {
        setSelectedDate(date);
        const formattedDate = formatDate(date);
        onChange(formattedDate);
      }
    } else {
      // iOS에서는 날짜가 변경될 때마다 업데이트
      if (date) {
        setSelectedDate(date);
      }
    }
  };

  const handleIOSConfirm = () => {
    setShowPicker(false);
    const formattedDate = formatDate(selectedDate);
    onChange(formattedDate);
  };

  const displayValue = value ? formatDisplayDate(value) : '';

  return (
    <View>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <StyledText
          fontSize={14}
          fontWeight={400}
          color={displayValue ? COLORS.text.primary : COLORS.text.secondary}
        >
          {displayValue || placeholder}
        </StyledText>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={minimumDate || new Date()}
          locale="ko-KR"
        />
      )}

      {Platform.OS === 'ios' && showPicker && (
        <View style={styles.iosButtonContainer}>
          <TouchableOpacity
            style={styles.iosButton}
            onPress={() => {
              setShowPicker(false);
            }}
          >
            <StyledText fontSize={15} fontWeight={600} color={COLORS.text.secondary}>
              취소
            </StyledText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iosButton, styles.iosConfirmButton]}
            onPress={handleIOSConfirm}
          >
            <StyledText fontSize={15} fontWeight={600} color={COLORS.primary}>
              확인
            </StyledText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
    minHeight: 48,
    justifyContent: 'center',
  },
  iosButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  iosButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  iosConfirmButton: {
    // iOS 확인 버튼 스타일
  },
});

export default DatePicker;
