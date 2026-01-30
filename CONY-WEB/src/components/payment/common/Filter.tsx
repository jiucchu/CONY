'use client';

import styled from "styled-components";
import { COLORS } from "@/constants/colors";
import { StyledText } from "@/utils/StyledText";
import { useState, useEffect } from "react";

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 0 20px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  flex: 1;
`;

const FilterButton = styled.button<{ $isSelected: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  border: ${props => props.$isSelected 
    ? `1px solid ${COLORS.primary}` 
    : `1px solid ${COLORS.background.lightGray}`};
  background-color: ${props => props.$isSelected 
    ? COLORS.white 
    : COLORS.background.lightGray};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;
export type SortType = 'registration' | 'distance' | 'period';

interface FilterProps {
  selectedSort?: SortType;
  onSortChange?: (sort: SortType) => void;
  onSearch?: (query: string) => void;
}

const Filter = ({ 
  selectedSort: initialSort = 'period',
  onSortChange,
  onSearch
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

  return (
    <FilterContainer>
          <ButtonGroup>
            <FilterButton
              $isSelected={selectedSort === 'registration'}
              onClick={() => handleSortClick('registration')}
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
              $isSelected={selectedSort === 'distance'}
              onClick={() => handleSortClick('distance')}
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
              $isSelected={selectedSort === 'period'}
              onClick={() => handleSortClick('period')}
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
    </FilterContainer>
  );
};

export default Filter;
