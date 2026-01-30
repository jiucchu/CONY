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

export type AvailableType = 'all' | 'available' | 'used';

interface AvailableFilterProps {
  selectedType?: AvailableType;
  onTypeChange?: (type: AvailableType) => void;
}

const AvailableFilter = ({
  selectedType: initialType = 'available',
  onTypeChange,
}: AvailableFilterProps) => {
  const [selectedType, setSelectedType] = useState<AvailableType>(initialType);

  useEffect(() => {
    setSelectedType(initialType);
  }, [initialType]);

  const handleTabClick = (type: AvailableType) => {
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
        style={styles.tabButton(selectedType === 'available')}
        onPress={() => handleTabClick('available')}
      >
        <StyledText fontSize={16} fontWeight={500} color={COLORS.text.primary}>
          사용가능
        </StyledText>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tabButton(selectedType === 'used')}
        onPress={() => handleTabClick('used')}
      >
        <StyledText fontSize={16} fontWeight={500} color={COLORS.text.primary}>
          사용완료
        </StyledText>
      </TouchableOpacity>
    </View>
  );
};

export default AvailableFilter;
