import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { COLORS } from '../../../constants/colors';
import { StyledText } from '../../../utils/StyledText';
import Svg, { Circle, Path } from 'react-native-svg';

export type SortType = 'registration' | 'distance' | 'period';

interface FilterProps {
  selectedSort?: SortType;
  onSortChange?: (sort: SortType) => void;
  onSearch?: (query: string) => void;
}

const MagnifyingGlassIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.text.primary} strokeWidth={2}>
    <Circle cx="11" cy="11" r="8" />
    <Path d="m21 21-4.35-4.35" />
  </Svg>
);

const SearchIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth={2}>
    <Circle cx="11" cy="11" r="8" />
    <Path d="m21 21-4.35-4.35" />
  </Svg>
);

const FilterContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding-vertical: 16px;
  padding-horizontal: 20px;
`;

const ButtonGroup = styled.View`
  flex-direction: row;
  gap: 8px;
  flex: 1;
`;

const FilterButton = styled.TouchableOpacity<{ isSelected: boolean }>`
  padding-vertical: 8px;
  padding-horizontal: 16px;
  border-radius: 20px;
  border-width: 1px;
  border-color: ${props => props.isSelected ? COLORS.primary : COLORS.background.lightGray};
  background-color: ${props => props.isSelected ? COLORS.white : COLORS.background.lightGray};
`;

const SearchButton = styled.TouchableOpacity`
  padding: 4px;
  justify-content: center;
  align-items: center;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  padding-vertical: 8px;
  padding-horizontal: 16px;
  border-width: 1px;
  border-color: ${COLORS.background.lightGray};
  border-radius: 20px;
  font-size: 14px;
  font-weight: 400;
  color: ${COLORS.text.primary};
  background-color: ${COLORS.background.lightGray};
`;

const SearchIconButton = styled.TouchableOpacity`
  padding: 4px;
  justify-content: center;
  align-items: center;
`;

const Filter: React.FC<FilterProps> = ({
  selectedSort: initialSort = 'period',
  onSortChange,
  onSearch,
}) => {
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
    <FilterContainer>
      {!isSearchVisible ? (
        <>
          <ButtonGroup>
            <FilterButton
              isSelected={selectedSort === 'registration'}
              onPress={() => handleSortClick('registration')}
              activeOpacity={0.8}
            >
              <StyledText
                fontSize={14}
                fontWeight={500}
                color={selectedSort === 'registration' ? COLORS.primary : COLORS.text.primary}
              >
                등록순
              </StyledText>
            </FilterButton>
            
            <FilterButton
              isSelected={selectedSort === 'distance'}
              onPress={() => handleSortClick('distance')}
              activeOpacity={0.8}
            >
              <StyledText
                fontSize={14}
                fontWeight={500}
                color={selectedSort === 'distance' ? COLORS.primary : COLORS.text.primary}
              >
                거리순
              </StyledText>
            </FilterButton>
            
            <FilterButton
              isSelected={selectedSort === 'period'}
              onPress={() => handleSortClick('period')}
              activeOpacity={0.8}
            >
              <StyledText
                fontSize={14}
                fontWeight={500}
                color={selectedSort === 'period' ? COLORS.primary : COLORS.text.primary}
              >
                기간순
              </StyledText>
            </FilterButton>
          </ButtonGroup>
          
          <SearchButton onPress={handleSearchToggle} activeOpacity={0.7}>
            <MagnifyingGlassIcon />
          </SearchButton>
        </>
      ) : (
        <>
          <SearchInput
            placeholder="찾고 싶은 브랜드, 물품명"
            placeholderTextColor={COLORS.text.secondary}
            value={searchQuery}
            onChangeText={handleSearchChange}
            onSubmitEditing={handleSearchSubmit}
            autoFocus
          />
          <SearchIconButton onPress={handleSearchToggle} activeOpacity={0.7}>
            <SearchIcon />
          </SearchIconButton>
        </>
      )}
    </FilterContainer>
  );
};

export default Filter;
