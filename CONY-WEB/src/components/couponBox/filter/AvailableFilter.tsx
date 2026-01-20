'use client';

import styled from "styled-components";
import { COLORS } from "@/constants/colors";
import { StyledText } from "@/utils/StyledText";
import { useState, useEffect } from "react";

const FilterContainer = styled.div`
  display: flex;
  width: 100%;
  padding: 0 12%;
  justify-content: space-between;
  border-bottom: 1px solid ${COLORS.background.lightGray};
`;

const TabButton = styled.button<{ isSelected: boolean }>`
  border: none;
  cursor: pointer;
  padding: 0;
  padding-bottom: 12px;
  position: relative;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: ${props => props.isSelected ? '3px' : '0px'};
    background-color: ${props => props.isSelected ? COLORS.primary : 'transparent'};
    border-radius: 3px 3px 0 0;
    transition: height 0.2s;
  }
`;

export type AvailableType = 'all' | 'available' | 'used';

interface AvailableFilterProps {
  selectedType?: AvailableType;
  onTypeChange?: (type: AvailableType) => void;
}

const AvailableFilter = ({
  selectedType: initialType = 'available',
  onTypeChange
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
    <FilterContainer>
      <TabButton
        isSelected={selectedType === 'all'}
        onClick={() => handleTabClick('all')}
      >
        <StyledText 
          fontSize={16} 
          fontWeight={500} 
          color={COLORS.text.primary}
        >
          전체보기
        </StyledText>
      </TabButton>
      <TabButton
        isSelected={selectedType === 'available'}
        onClick={() => handleTabClick('available')}
      >
        <StyledText 
          fontSize={16} 
          fontWeight={500} 
          color={COLORS.text.primary}
        >
          사용가능
        </StyledText>
      </TabButton>
      <TabButton
        isSelected={selectedType === 'used'}
        onClick={() => handleTabClick('used')}
      >
        <StyledText 
          fontSize={16} 
          fontWeight={500} 
          color={COLORS.text.primary}
        >
          사용완료
        </StyledText>
      </TabButton>
    </FilterContainer>
  );
};

export default AvailableFilter;
