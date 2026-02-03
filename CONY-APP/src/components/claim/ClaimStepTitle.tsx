import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props { step: number; mainTitle: string; subTitle: string; }

export const ClaimStepTitle = ({ step, mainTitle, subTitle }: Props) => (
  <View style={styles.container}>
    <View style={styles.badge}><Text style={styles.badgeText}>{step}</Text></View>
    <Text style={styles.main}>{mainTitle}</Text>
    <Text style={styles.sub}>{subTitle}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: 32 },
  badge: { width: 28, height: 28, backgroundColor: '#F45184', borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  main: { fontSize: 22, fontWeight: 'bold', color: '#111', marginBottom: 8 },
  sub: { fontSize: 14, color: '#888' },
});