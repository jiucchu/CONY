import React from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { COLORS } from '@/constants/colors';

interface SwitchToggleProps {
  isOn: boolean;
  onPress: () => void;
  ariaLabel?: string;
}

const SwitchToggle = ({ isOn, onPress, ariaLabel }: SwitchToggleProps) => {
  const translateX = React.useRef(new Animated.Value(isOn ? 20 : 0)).current;

  React.useEffect(() => {
    Animated.timing(translateX, {
      toValue: isOn ? 20 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOn]);

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={ariaLabel}
      style={[
        styles.container,
        { backgroundColor: isOn ? COLORS.primary : COLORS.background.lightGray },
      ]}
    >
      <Animated.View
        style={[
          styles.thumb,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default SwitchToggle;
