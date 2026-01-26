'use client';

import styled from "styled-components";
import { COLORS } from "@/constants/colors";
import { StyledText } from "@/utils/StyledText";

const BrandButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const IconButton = styled.button<{ $isSelected: boolean }>`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background-color: ${COLORS.background.lightGray};
  border: ${props => props.$isSelected 
    ? `2px solid ${COLORS.primary}` 
    : 'none'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s;

  &:hover {
    opacity: 0.8;
  }

  img {
    width: 60px;
    height: 60px;
    object-fit: contain;
  }
`;

interface BrandButtonProps {
  label: string;
  iconSrc?: string;
  isSelected?: boolean;
  onClick?: () => void;
}

const BrandButton = ({ 
  label, 
  iconSrc, 
  isSelected = false,
  onClick 
}: BrandButtonProps) => {
  return (
    <BrandButtonContainer>
      <IconButton 
        $isSelected={isSelected}
        onClick={onClick}
        aria-label={label}
      >
        {iconSrc && <img src={iconSrc} alt={label} />}
      </IconButton>
      <StyledText 
        fontSize={12} 
        fontWeight={isSelected ? 900 : 400} 
        color={COLORS.text.primary}
      >
        {label}
      </StyledText>
    </BrandButtonContainer>
  );
};

export default BrandButton;