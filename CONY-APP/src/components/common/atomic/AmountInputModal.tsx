import React from 'react';
import { View, StyleSheet, Modal, TextInput, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';

interface AmountInputModalProps {
  currentBalance: number;
  amount: string;
  onAmountChange: (amount: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  title?: string;
  placeholder?: string;
}

const AmountInputModal = ({
  currentBalance,
  amount,
  onAmountChange,
  onClose,
  onSubmit,
  title = '금액 사용',
  placeholder = '사용할 금액을 입력하세요',
}: AmountInputModalProps) => {
  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.content}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <StyledText fontSize={18} fontWeight={700} color={COLORS.text.primary}>
            {title}
          </StyledText>
          <View style={styles.inputGroup}>
            <StyledText fontSize={14} fontWeight={500} color={COLORS.text.secondary}>
              현재 잔액: {currentBalance.toLocaleString('ko-KR')}원
            </StyledText>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={onAmountChange}
              placeholder={placeholder}
              keyboardType="numeric"
              textAlign="right"
              placeholderTextColor={COLORS.text.secondary}
            />
          </View>
          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <StyledText fontSize={15} fontWeight={600} color={COLORS.text.secondary}>
                취소
              </StyledText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
              <StyledText fontSize={15} fontWeight={600} color={COLORS.white}>
                확인
              </StyledText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  inputGroup: {
    gap: 8,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.background.lightGray,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'Pretendard',
    textAlign: 'right',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: COLORS.background.lightGray,
  },
  submitButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
});

export default AmountInputModal;
