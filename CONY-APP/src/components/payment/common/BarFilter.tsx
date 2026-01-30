import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: '12%',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background.lightGray,
  },
  tabButton: (isSelected: boolean) => ({
    paddingBottom: 12,
    borderBottomWidth: isSelected ? 3 : 0,
    borderBottomColor: isSelected ? COLORS.primary : 'transparent',
  }),
});

export type BarType = 'all' | 'cafe' | 'convenience';

interface BarFilterProps {
  selectedType?: BarType;
  onTypeChange?: (type: BarType) => void;
}

const BarFilter = ({
  selectedType: initialType = 'cafe',
  onTypeChange,
}: BarFilterProps) => {
  const [selectedType, setSelectedType] = useState<BarType>(initialType);

  useEffect(() => {
    setSelectedType(initialType);
  }, [initialType]);

  const handleTabClick = (type: BarType) => {
    setSelectedType(type);
    onTypeChange?.(type);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.tabButton(selectedType === 'all')}
        onPress={() => handleTabClick('all')}
      >
        <StyledText fontSize={16} fontWeight={500} color={COLORS.text.primary}>
          전체보기
        </StyledText>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tabButton(selectedType === 'cafe')}
        onPress={() => handleTabClick('cafe')}
      >
        <StyledText fontSize={16} fontWeight={500} color={COLORS.text.primary}>
          카페
        </StyledText>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tabButton(selectedType === 'convenience')}
        onPress={() => handleTabClick('convenience')}
      >
        <StyledText fontSize={16} fontWeight={500} color={COLORS.text.primary}>
          편의점
        </StyledText>
      </TouchableOpacity>
    </View>
  );
};

export default BarFilter;
