'use client';

import styled from "styled-components";
import { COLORS } from "@/constants/colors";
import { StyledText } from "@/utils/StyledText";

const FolderContainer = styled.div<{ type: 'selected' | 'unselected' }>`
  position: relative;
  width: 80px;
  aspect-ratio: 1.4;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const FolderTab = styled.div<{ type: 'selected' | 'unselected' }>`
  position: absolute;
  top: -8px;

  width: 40px;
  height: 20px;
  background: ${props => props.type === 'selected' 
    ? COLORS.primary
    : COLORS.background.lightGray};
  border-radius: 10px 10px 0 0;
  z-index: 0;
`;

const FolderBody = styled.div<{ type: 'selected' | 'unselected' }>`
  z-index: 1;
  width: 100%;
  height: 100%;
  padding: 10% 15%;
  background: ${props => props.type === 'selected'
    ? `linear-gradient(180deg, ${COLORS.primary} 0%, #FFA4C1 100%)`
    : COLORS.background.gray};
  border-radius: 16px;
  display: flex;
  align-items: end;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
`;

const FolderText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

interface FolderProps {
  type?: 'selected' | 'unselected';
  title?: string;
  onClick?: () => void;
}

const Folder = ({ type = 'selected', title, onClick }: FolderProps) => {
  return (
    <FolderContainer type={type} onClick={onClick}>
      <FolderTab type={type} />
      <FolderBody type={type}>
        <FolderText>
          <StyledText fontSize={12} fontWeight={600} color={COLORS.text.white}>
            {title}
          </StyledText>
        </FolderText>
      </FolderBody>
    </FolderContainer>
  );
};

export default Folder;
