import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  iconButton: (isSelected: boolean) => ({
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: COLORS.background.lightGray,
    borderWidth: isSelected ? 2 : 0,
    borderColor: isSelected ? COLORS.primary : 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  icon: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
});

interface BrandButtonProps {
  label: string;
  iconSrc?: string | number;
  isSelected?: boolean;
  onPress?: () => void;
}

const BrandButton = ({
  label,
  iconSrc,
  isSelected = false,
  onPress,
}: BrandButtonProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.iconButton(isSelected)}
        onPress={onPress}
      >
        {iconSrc && (
          <Image
            source={typeof iconSrc === 'string' ? { uri: iconSrc } : iconSrc}
            style={styles.icon}
          />
        )}
      </TouchableOpacity>
      <StyledText
        fontSize={12}
        fontWeight={isSelected ? 900 : 400}
        color={COLORS.text.primary}
      >
        {label}
      </StyledText>
    </View>
  );
};

export default BrandButton;
