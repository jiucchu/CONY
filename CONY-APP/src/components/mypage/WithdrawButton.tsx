import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';

const styles = StyleSheet.create({
  container: {
    width: '90%',
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.background.gray,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

interface WithdrawButtonProps {
  onPress?: () => void;
}

const WithdrawButton = ({ onPress }: WithdrawButtonProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <StyledText fontSize={16} fontWeight={600} color={COLORS.text.primary}>
        회원 탈퇴
      </StyledText>
    </TouchableOpacity>
  );
};

export default WithdrawButton;
