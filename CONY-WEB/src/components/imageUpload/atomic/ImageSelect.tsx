'use client';

import styled from "styled-components";
import { COLORS } from "@/constants/colors";
import { useState } from "react";

const ImageContainer = styled.div<{ $isSelected: boolean }>`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background-color: ${COLORS.background.lightGray};
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.02);
  }
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const CheckBadge = styled.div<{ $isSelected: boolean }>`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${props => props.$isSelected ? COLORS.primary : 'lightgray'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  z-index: 10;
`;

const CheckIcon = styled.svg<{ $isSelected: boolean }>`
  width: 14px;
  height: 14px;
  opacity: 1;
  transition: fill 0.2s, stroke 0.2s;
`;

interface ImageSelectProps {
  imageUrl: string;
  imageAlt?: string;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
}

const ImageSelect = ({ 
  imageUrl, 
  imageAlt = "이미지", 
  isSelected: controlledSelected,
  onSelect 
}: ImageSelectProps) => {
  const [internalSelected, setInternalSelected] = useState(false);
  const isSelected = controlledSelected !== undefined ? controlledSelected : internalSelected;

  const handleClick = () => {
    const newSelected = !isSelected;
    if (controlledSelected === undefined) {
      setInternalSelected(newSelected);
    }
    onSelect?.(newSelected);
  };

  return (
    <ImageContainer $isSelected={isSelected} onClick={handleClick}>
      <Image src={imageUrl} alt={imageAlt} />
      <CheckBadge $isSelected={isSelected}>
        <CheckIcon 
          $isSelected={isSelected} 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
            fill={COLORS.white}
            stroke={COLORS.white}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </CheckIcon>
      </CheckBadge>
    </ImageContainer>
  );
};

export default ImageSelect;
