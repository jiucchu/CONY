import React from 'react';
import { TouchableOpacity, StyleSheet, Image, View, Text } from 'react-native';
import { COLORS } from '@/constants/colors';

const styles = StyleSheet.create({
  container: (color: string) => ({
    width: '100%',
    backgroundColor: color,
    borderRadius: 100,
    paddingVertical: 14,
    paddingHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  }),
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  text: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
});

interface LoginButtonProps {
  onPress?: () => void;
  iconSrc?: string | number | React.ComponentType<any>;
  iconAlt?: string;
  color?: string;
  children?: React.ReactNode;
}

const LoginButton = ({
  onPress,
  iconSrc,
  iconAlt,
  color,
  children,
}: LoginButtonProps) => {
  const renderIcon = () => {
    if (!iconSrc) return null;
    
    // React 컴포넌트인 경우
    if (typeof iconSrc === 'function' || React.isValidElement(iconSrc)) {
      const IconComponent = iconSrc as React.ComponentType<any>;
      return <IconComponent />;
    }
    
    // Image source인 경우
    return (
      <Image
        source={typeof iconSrc === 'string' ? { uri: iconSrc } : iconSrc}
        style={styles.icon}
        accessibilityLabel={iconAlt}
      />
    );
  };

  return (
    <TouchableOpacity
      style={styles.container(color || COLORS.white)}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        {renderIcon()}
      </View>
      <View style={{ flex: 1 }}>
        {typeof children === 'string' ? (
          <Text style={styles.text}>{children}</Text>
        ) : (
          children
        )}
      </View>
    </TouchableOpacity>
  );
};

export default LoginButton;
