import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

interface StyledTextProps extends TextProps {
  fontSize: number;
  fontWeight?: number;
  color?: string;
}

export const StyledText: React.FC<StyledTextProps> = ({
  fontSize,
  fontWeight,
  color,
  style,
  children,
  ...props
}) => {
  return (
    <Text
      style={[
        {
          fontSize,
          ...(fontWeight !== undefined && { fontWeight: fontWeight.toString() as any }),
          color: color || '#000000',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};
