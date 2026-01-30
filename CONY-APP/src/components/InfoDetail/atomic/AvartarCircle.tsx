import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { COLORS } from '@/constants/colors';

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.lightGray,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
});

const AvatarCircle = ({ imageUrl }: { imageUrl?: string }) => {
  return (
    <View style={styles.container}>
      {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}
    </View>
  );
};

export default AvatarCircle;
