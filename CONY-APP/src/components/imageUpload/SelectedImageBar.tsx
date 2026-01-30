import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SelectedImage from './atomic/SelectedImage';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 8,
  },
});

interface SelectedImageBarProps {
  images: string[];
  onRemove: (imageUrl: string) => void;
}

const SelectedImageBar = ({ images, onRemove }: SelectedImageBarProps) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {images.map((image) => (
        <SelectedImage key={image} imageUrl={image} onRemove={() => onRemove(image)} />
      ))}
    </ScrollView>
  );
};

export default SelectedImageBar;
