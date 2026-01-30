import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 40,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

interface DefaultButtonProps {
  onPress?: () => void;
  children: string;
}

const DefaultButton = ({ onPress, children }: DefaultButtonProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <StyledText fontSize={18} fontWeight={800} color={COLORS.white}>
        {children}
      </StyledText>
    </TouchableOpacity>
  );
};

export { DefaultButton };
