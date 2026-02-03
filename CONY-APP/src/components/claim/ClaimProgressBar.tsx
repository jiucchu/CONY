import React from 'react';
import { View, StyleSheet, DimensionValue } from 'react-native';

interface Props {
  step: number;
}

export const ClaimProgressBar = ({ step }: Props) => {
  const progressWidth: DimensionValue = `${(step / 3) * 100}%`;

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: progressWidth }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: { width: '100%', height: 3, backgroundColor: '#f0f0f0' },
  fill: { height: '100%', backgroundColor: '#F45184' },
});