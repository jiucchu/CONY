'use client';

import styled from "styled-components";
import { COLORS } from "@/constants/colors";
import { useState } from "react";
import SelectedImageBar from "./SelectedImageBar";
import ImageSelect from "./atomic/ImageSelect";
import { DefaultButton } from "../common/atomic/Button";

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  opacity: ${props => props.$isOpen ? 1 : 0};
  transition: opacity 0.3s ease;
  pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};
`;

const ModalContainer = styled.div<{ $isOpen: boolean }>`
  width: 100%;
  max-height: 90vh;
  background-color: ${COLORS.white};
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform: translateY(${props => props.$isOpen ? '0' : '100%'});
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
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none; /* Firefox */
  -webkit-overflow-scrolling: touch;
  align-items: start;
  
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Edge */
  }
  
  > * {
    width: 100%;
    min-width: 0;
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
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContainer $isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
        {/* 모달 헤더 */}
        <Header>
          <HandleBar />
          <DirectUploadButton onClick={onDirectUpload}>
            직접 등록하기
          </DirectUploadButton>
        </Header>
        
        {/* 선택된 이미지 바 */}
        <SelectedSection>
          <SelectedImageBar 
            images={selectedImages}
            onRemove={handleImageRemove}
          />
        </SelectedSection>

        {/* 이미지 그리드 */}
        <ImageGrid>
          {images.map((imageUrl) => (
            <div style={{ width: '100%', aspectRatio: '1' }} key={imageUrl}>
              <ImageSelect
                imageUrl={imageUrl}
                isSelected={selectedImages.includes(imageUrl)}
                onSelect={(selected) => handleImageSelect(imageUrl, selected)}
              />
            </div>
          ))}
        </ImageGrid>

        {/* 완료 버튼 */}
        <div style={{ position: 'sticky', bottom: '0', padding: '20px 20%' }}>
          <DefaultButton onClick={handleComplete}>선택 완료</DefaultButton>
        </div>
      </ModalContainer>
    </ModalOverlay>
  )
}

export default ImageUploadModal
