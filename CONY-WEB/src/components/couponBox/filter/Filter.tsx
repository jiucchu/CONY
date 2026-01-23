'use client';

import styled from "styled-components";
import { COLORS } from "@/constants/colors";
import { StyledText } from "@/utils/StyledText";
import { useState, useEffect } from "react";

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  flex: 1;
`;

const FilterButton = styled.button<{ isSelected: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  border: ${props => props.isSelected 
    ? `1px solid ${COLORS.primary}` 
    : `1px solid ${COLORS.background.lightGray}`};
  background-color: ${props => props.isSelected 
    ? COLORS.white 
    : COLORS.background.lightGray};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const SearchButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }

  svg {
    width: 24px;
    height: 24px;
    stroke: ${COLORS.text.primary};
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 8px 16px;
  border: 1px solid ${COLORS.background.lightGray};
  border-radius: 20px;
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: ${COLORS.text.primary};
  background-color: ${COLORS.background.lightGray};
  outline: none;
  transition: border-color 0.2s;

  &::placeholder {
    color: ${COLORS.text.secondary};
  }

  &:focus {
    border-color: ${COLORS.primary};
    background-color: ${COLORS.white};
  }
`;

const SearchIconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }

  svg {
    width: 24px;
    height: 24px;
    stroke: ${COLORS.primary};
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;

const MagnifyingGlassIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
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

  const handleSearchToggle = () => {
    setIsSearchVisible(!isSearchVisible);
    if (isSearchVisible) {
      setSearchQuery('');
      onSearch?.('');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
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
              isSelected={selectedSort === 'distance'}
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
              isSelected={selectedSort === 'period'}
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
          <SearchButton onClick={handleSearchToggle} aria-label="검색">
            <MagnifyingGlassIcon />
          </SearchButton>
        </>
      ) : (
        <>
          <SearchInput
            type="text"
            placeholder="찾고 싶은 브랜드, 물품명"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearchSubmit();
              }
            }}
            autoFocus
          />
          <SearchIconButton onClick={handleSearchToggle} aria-label="검색 닫기">
            <MagnifyingGlassIcon />
          </SearchIconButton>
        </>
      )}
    </FilterContainer>
  );
};

export default Filter;
