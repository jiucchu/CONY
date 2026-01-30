'use client';

import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';
import { FolderData } from '@/types/coupon/coupon';

const SelectorContainer = styled.div`
  position: relative;
  width: 20%;
  min-width: 120px;
`;

const SelectorButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  background-color: ${COLORS.white};
  border: 1px solid ${COLORS.background.lightGray};
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${COLORS.primary};
  }

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
  }
`;

const FolderIconWrapper = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const FolderIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <defs>
      <linearGradient id="folderGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={COLORS.primary} />
        <stop offset="100%" stopColor="#FFA4C1" />
      </linearGradient>
    </defs>
    <path
      d="M3 7C3 5.89543 3.89543 5 5 5H9.58579C9.851 5 10.1054 5.10536 10.2929 5.29289L12.7071 7.70711C12.8946 7.89464 13.149 8 13.4142 8H19C20.1046 8 21 8.89543 21 10V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z"
      fill="url(#folderGradient)"
    />
  </svg>
);

const TextContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  text-align: left;
`;

const ChevronIcon = styled.div<{ $isOpen: boolean }>`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  flex-shrink: 0;

  svg {
    width: 100%;
    height: 100%;
    stroke: ${COLORS.text.secondary};
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;

const ChevronDown = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const DropdownMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background-color: ${COLORS.white};
  border: 1px solid ${COLORS.background.lightGray};
  border-radius: 12px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 1000;
  opacity: ${props => props.$isOpen ? 1 : 0};
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};
  transition: opacity 0.2s, transform 0.2s;
  max-height: 300px;
  overflow-y: auto;
`;

const DropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background-color: ${COLORS.white};
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  text-align: left;

  &:hover {
    background-color: ${COLORS.background.lightGray};
  }

  &:first-child {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }

  &:last-child {
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
  }
`;

interface FolderSelectorProps {
  folders: FolderData[];
  selectedFolderId?: string;
  onSelect?: (folderId: string) => void;
  placeholder?: string;
}

const FolderSelector = ({ 
  folders, 
  selectedFolderId, 
  onSelect,
  placeholder = '기본 폴더'
}: FolderSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedFolder = folders.find(f => f.id === selectedFolderId) || folders[0];
  const displayText = selectedFolder?.title || placeholder;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (folderId: string) => {
    onSelect?.(folderId);
    setIsOpen(false);
  };

  return (
    <SelectorContainer ref={containerRef}>
      <SelectorButton onClick={() => setIsOpen(!isOpen)}>
        <FolderIconWrapper>
          <FolderIcon />
        </FolderIconWrapper>
        <TextContainer>
          <StyledText fontSize={14} fontWeight={400} color={COLORS.text.primary}>
            {displayText}
          </StyledText>
        </TextContainer>
        <ChevronIcon $isOpen={isOpen}>
          <ChevronDown />
        </ChevronIcon>
      </SelectorButton>
      
      <DropdownMenu $isOpen={isOpen}>
        {folders.map((folder) => (
          <DropdownItem
            key={folder.id}
            onClick={() => handleSelect(folder.id)}
          >
            <FolderIconWrapper>
              <FolderIcon />
            </FolderIconWrapper>
            <TextContainer>
              <StyledText fontSize={14} fontWeight={400} color={COLORS.text.primary}>
                {folder.title}
              </StyledText>
            </TextContainer>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </SelectorContainer>
  );
};

export default FolderSelector;