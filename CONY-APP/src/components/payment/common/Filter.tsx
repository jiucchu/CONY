import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 15,
    flex: 1,
  },
  filterButton: (isSelected: boolean) => ({
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: isSelected ? COLORS.primary : COLORS.background.lightGray,
    backgroundColor: isSelected ? COLORS.white : COLORS.background.lightGray,
  }),
});

export type SortType = 'registration' | 'distance' | 'period';

interface FilterProps {
  selectedSort?: SortType;
  onSortChange?: (sort: SortType) => void;
  onSearch?: (query: string) => void;
}

const Filter = ({
  selectedSort: initialSort = 'period',
  onSortChange,
  onSearch,
}: FilterProps) => {
  const [selectedSort, setSelectedSort] = useState<SortType>(initialSort);

  useEffect(() => {
    setSelectedSort(initialSort);
  }, [initialSort]);

  const handleSortClick = (sort: SortType) => {
    setSelectedSort(sort);
    onSortChange?.(sort);
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.filterButton(selectedSort === 'registration')}
          onPress={() => handleSortClick('registration')}
        >
          <StyledText
            fontSize={14}
            fontWeight={500}
            color={selectedSort === 'registration' ? COLORS.primary : COLORS.text.primary}
          >
            등록순
          </StyledText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton(selectedSort === 'distance')}
          onPress={() => handleSortClick('distance')}
        >
          <StyledText
            fontSize={14}
            fontWeight={500}
            color={selectedSort === 'distance' ? COLORS.primary : COLORS.text.primary}
          >
            거리순
          </StyledText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton(selectedSort === 'period')}
          onPress={() => handleSortClick('period')}
        >
          <StyledText
            fontSize={14}
            fontWeight={500}
            color={selectedSort === 'period' ? COLORS.primary : COLORS.text.primary}
          >
            기간순
          </StyledText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Filter;
