'use client';

import styled from "styled-components";
import { COLORS } from "@/constants/colors";

const ImageContainer = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ImageCard = styled.div`
  position: relative;
  width: 85%;
  height: 85%;
  background-color: gray;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0px;
  right: 0px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${COLORS.primary};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  z-index: 10;
  transition: transform 0.2s;

  &:active {
    transform: scale(0.95);
  }
`;

const CloseIcon = styled.svg`
  width: 12px;
  height: 12px;
`;

interface SelectedImageProps {
  imageUrl: string;
  imageAlt?: string;
  onRemove: () => void;
}

const SelectedImage = ({ 
  imageUrl, 
  imageAlt = "선택된 이미지",
  onRemove 
}: SelectedImageProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
  };

  return (
    <ImageContainer>
        <CloseButton onClick={handleClick} aria-label="이미지 제거">
        <CloseIcon 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18 6L6 18M6 6l12 12"
            stroke={COLORS.white}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </CloseIcon>
      </CloseButton>
    <ImageCard>
      <Image src={imageUrl} alt={imageAlt} />
      
    </ImageCard>
    </ImageContainer>
  );
};

export default SelectedImage;
