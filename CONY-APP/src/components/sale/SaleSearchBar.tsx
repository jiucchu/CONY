import React from 'react';
import styled from 'styled-components/native';
import { COLORS } from '@/constants/colors';
import { Svg, Path, Circle } from 'react-native-svg';

const SearchContainer = styled.View`
  padding: 16px 20px;
`;

const SearchBar = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${COLORS.background.white};
  opacity: 0.8;
  border-radius: 12px;
  padding: 2px 10px;
  gap: 12px;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  font-size: 14px;
  color: ${COLORS.text.primary};
`;

const SearchIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={COLORS.text.secondary} strokeWidth={2}>
    <Circle cx="11" cy="11" r="8" />
    <Path d="m21 21-4.35-4.35" />
  </Svg>
);

interface SaleSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const SaleSearchBar = ({ value, onChangeText, placeholder = '찾고 싶은 브랜드, 물품명' }: SaleSearchBarProps) => {
  return (
    <SearchContainer>
      <SearchBar>
        <SearchIcon />
        <SearchInput
          placeholder={placeholder}
          placeholderTextColor={COLORS.text.secondary}
          value={value}
          onChangeText={onChangeText}
        />
      </SearchBar>
    </SearchContainer>
  );
};

export default SaleSearchBar;
