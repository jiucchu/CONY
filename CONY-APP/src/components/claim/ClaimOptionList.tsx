import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props { options: string[]; onSelect: (item: string) => void; }

export const ClaimOptionList = ({ options, onSelect }: Props) => (
  <View style={styles.container}>
    {options.map((item) => (
      <TouchableOpacity key={item} style={styles.button} onPress={() => onSelect(item)}>
        <Text style={styles.text}>{item}</Text>
        <Text style={styles.arrow}>〉</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: { gap: 12 },
  button: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderWidth: 1, borderColor: '#eee', borderRadius: 12, backgroundColor: '#fff' },
  text: { fontSize: 16, color: '#333' },
  arrow: { fontSize: 16, color: '#ccc' },
});