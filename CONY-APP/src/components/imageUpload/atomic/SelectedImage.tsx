import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/colors';
import { Svg, Line } from 'react-native-svg';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imageCard: {
    position: 'relative',
    width: '85%',
    height: '85%',
    backgroundColor: 'gray',
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});

const CloseIcon = () => (
  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={COLORS.white} strokeWidth={2}>
    <Line x1="18" y1="6" x2="6" y2="18" />
    <Line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
);

interface SelectedImageProps {
  imageUrl: string;
  imageAlt?: string;
  onRemove: () => void;
}

const SelectedImage = ({
  imageUrl,
  imageAlt = '선택된 이미지',
  onRemove,
}: SelectedImageProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onRemove}>
        <CloseIcon />
      </TouchableOpacity>
      <View style={styles.imageCard}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
      </View>
    </View>
  );
};

export default SelectedImage;
