import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';
import { Svg, Circle, Path } from 'react-native-svg';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
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
  searchButton: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.background.lightGray,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.lightGray,
  },
  searchInputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
});

const MagnifyingGlassIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.text.primary} strokeWidth={2}>
    <Circle cx="11" cy="11" r="8" />
    <Path d="m21 21-4.35-4.35" />
  </Svg>
);

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
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState<SortType>(initialSort);

  useEffect(() => {
    setSelectedSort(initialSort);
  }, [initialSort]);

  const handleSortClick = (sort: SortType) => {
    setSelectedSort(sort);
    onSortChange?.(sort);
  };

  const handleSearchToggle = () => {
    setIsSearchVisible(!isSearchVisible);
    if (isSearchVisible) {
      setSearchQuery('');
      onSearch?.('');
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    onSearch?.(text);
  };

  const handleSearchSubmit = () => {
    onSearch?.(searchQuery);
  };

  return (
    <View style={styles.container}>
      {!isSearchVisible ? (
        <>
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
          <TouchableOpacity style={styles.searchButton} onPress={handleSearchToggle}>
            <MagnifyingGlassIcon />
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={[styles.searchInput, styles.searchInputFocused]}
            placeholder="찾고 싶은 브랜드, 물품명"
            placeholderTextColor={COLORS.text.secondary}
            value={searchQuery}
            onChangeText={handleSearchChange}
            onSubmitEditing={handleSearchSubmit}
            autoFocus
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearchToggle}>
            <MagnifyingGlassIcon />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default Filter;
