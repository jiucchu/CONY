'use client';

import styled from "styled-components";
import { COLORS } from "@/constants/colors";
import { useState } from "react";
import SelectedImageBar from "./SelectedImageBar";
import ImageSelect from "./atomic/ImageSelect";

const ModalOverlay = styled.div<{ isOpen: boolean }>`
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  opacity: ${props => props.isOpen ? 1 : 0};
  transition: opacity 0.3s ease;
  pointer-events: ${props => props.isOpen ? 'auto' : 'none'};
`;

const ModalContainer = styled.div<{ isOpen: boolean }>`
  margin: 0 auto;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform: translateY(${props => props.isOpen ? '0' : '100%'});
  transition: transform 0.3s ease-out;
`;

const Header = styled.div`
  position: relative;
  padding: 16px 20px;
  background-color: ${COLORS.white};
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const HandleBar = styled.div`
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 4px;
  background-color: ${COLORS.background.lightGray};
  border-radius: 2px;
`;

const DirectUploadButton = styled.button`
  padding: 8px 16px;
  background-color: ${COLORS.primary};
  color: ${COLORS.white};
  border: none;
  border-radius: 20px;
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 0.8;
  }
`;

const SelectedSection = styled.div`
  padding: 16px 20px;
  background-color: ${COLORS.white};
  border-bottom: 1px solid ${COLORS.background.lightGray};
`;

const ImageGrid = styled.div`
  background-color: ${COLORS.background.white};
  flex: 1;
  padding: 5%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Edge */
  }
`;



interface ImageUploadModalProps {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: (selectedImages: string[]) => void;
  onDirectUpload?: () => void;
}

const ImageUploadModal = ({
  images,
  isOpen,
  onClose,
  onComplete,
  onDirectUpload
}: ImageUploadModalProps) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const handleImageSelect = (imageUrl: string, selected: boolean) => {
    if (selected) {
      setSelectedImages(prev => [...prev, imageUrl]);
    } else {
      setSelectedImages(prev => prev.filter(url => url !== imageUrl));
    }
  };

  const handleImageRemove = (imageUrl: string) => {
    setSelectedImages(prev => prev.filter(url => url !== imageUrl));
  };

  const handleComplete = () => {
    onComplete(selectedImages);
    setSelectedImages([]);
  };

  return (
    <ModalOverlay isOpen={isOpen} onClick={onClose}>
      <ModalContainer isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
        <Header>
          <HandleBar />
          <DirectUploadButton onClick={onDirectUpload}>
            직접 등록하기
          </DirectUploadButton>
        </Header>
        
        <SelectedSection>
          <SelectedImageBar 
            images={selectedImages}
            onRemove={handleImageRemove}
          />
        </SelectedSection>

        <ImageGrid>
          {images.map((imageUrl) => (
            <ImageSelect
              key={imageUrl}
              imageUrl={imageUrl}
              isSelected={selectedImages.includes(imageUrl)}
              onSelect={(selected) => handleImageSelect(imageUrl, selected)}
            />
          ))}
        </ImageGrid>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ImageUploadModal;
