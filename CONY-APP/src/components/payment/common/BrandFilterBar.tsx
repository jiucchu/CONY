import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import BrandButton from './atomic/BrandButton';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: '5%',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
});

const BrandFilterBar = ({ brands }: { brands: string[] }) => {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  const selectButton = (brand: string) => {
    setSelectedBrand(brand);
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {brands.map((brand) => (
        <View key={brand} style={styles.buttonContainer}>
          <BrandButton
            label={brand}
            isSelected={selectedBrand === brand}
            onPress={() => selectButton(brand)}
          />
        </View>
      ))}
    </ScrollView>
  );
};

export default BrandFilterBar;
