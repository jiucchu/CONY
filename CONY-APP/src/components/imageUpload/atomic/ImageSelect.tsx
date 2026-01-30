import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/colors';
import { Svg, Path } from 'react-native-svg';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    backgroundColor: COLORS.background.lightGray,
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  checkBadge: (isSelected: boolean) => ({
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: isSelected ? COLORS.primary : 'lightgray',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  }),
});

const CheckIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={COLORS.white} strokeWidth={2}>
    <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
  </Svg>
);

interface ImageSelectProps {
  imageUrl: string;
  imageAlt?: string;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
}

const ImageSelect = ({
  imageUrl,
  imageAlt = '이미지',
  isSelected: controlledSelected,
  onSelect,
}: ImageSelectProps) => {
  const [internalSelected, setInternalSelected] = useState(false);
  const isSelected = controlledSelected !== undefined ? controlledSelected : internalSelected;

  const handlePress = () => {
    const newSelected = !isSelected;
    if (controlledSelected === undefined) {
      setInternalSelected(newSelected);
    }
    onSelect?.(newSelected);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.9}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.checkBadge(isSelected)}>
        {isSelected && <CheckIcon />}
      </View>
    </TouchableOpacity>
  );
};

export default ImageSelect;
