import React from 'react';
import styled from 'styled-components/native';
import { COLORS } from '../../../constants/colors';
import { StyledText } from '../../../utils/StyledText';

interface FolderProps {
  type?: 'selected' | 'unselected';
  title?: string;
  onClick?: () => void;
}

const FolderContainer = styled.TouchableOpacity`
  position: relative;
  width: 100px;
  height: 80px;
`;

const FolderTab = styled.View<{ type: 'selected' | 'unselected' }>`
  position: absolute;
  top: -8px;
  width: 50px;
  height: 20px;
  background-color: ${props => props.type === 'selected' ? COLORS.primary : COLORS.background.lightGray};
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  z-index: 0;
`;

const FolderBody = styled.View<{ type: 'selected' | 'unselected' }>`
  z-index: 1;
  width: 100%;
  height: 100%;
  padding-horizontal: 15%;
  padding-vertical: 10%;
  background-color: ${props => props.type === 'selected' ? COLORS.primary : COLORS.background.gray};
  border-radius: 16px;
  align-items: flex-end;
  justify-content: flex-end;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  elevation: 4;
`;

const FolderText = styled.View`
  align-items: center;
  gap: 4px;
`;

const Folder: React.FC<FolderProps> = ({ type = 'selected', title, onClick }) => {
  return (
    <FolderContainer onPress={onClick} activeOpacity={0.8}>
      <FolderTab type={type} />
      <FolderBody type={type}>
        <FolderText>
          <StyledText fontSize={14} fontWeight={600} color={COLORS.text.white}>
            {title}
          </StyledText>
        </FolderText>
      </FolderBody>
    </FolderContainer>
  );
};

export default Folder;
