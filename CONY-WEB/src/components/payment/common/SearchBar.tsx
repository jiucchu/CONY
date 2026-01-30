'use client';

import styled from "styled-components";
import { COLORS } from "@/constants/colors";
import { useState } from "react";

const SearchBarContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 20px;
  margin-bottom: 16px;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  background-color: #f0f0f0;
  border-radius: 20px;
  padding: 12px 16px;
  gap: 12px;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-family: 'Pretendard', sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: ${COLORS.text.primary};

  &::placeholder {
    color: ${COLORS.text.secondary};
    font-size: 16px;
  }
`;

const SearchIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    width: 20px;
    height: 20px;
    stroke: ${COLORS.text.primary};
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

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  value?: string;
  onChange?: (value: string) => void;
  onFocusChange?: (isFocused: boolean) => void;
}

const SearchBar = ({
  placeholder = "찾고 싶은 브랜드, 물품명",
  onSearch,
  value: controlledValue,
  onChange,
  onFocusChange,
}: SearchBarProps) => {
  const [internalValue, setInternalValue] = useState('');

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (isControlled) {
      onChange?.(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.(value);
    }
  };

  const handleFocus = () => {
    onFocusChange?.(true);
  };

  const handleBlur = () => {
    onFocusChange?.(false);
  };

  return (
    <SearchBarContainer>
      <SearchInputWrapper>
        <SearchInput
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        <SearchIcon>
          <MagnifyingGlassIcon />
        </SearchIcon>
      </SearchInputWrapper>
    </SearchBarContainer>
  );
};

export default SearchBar;