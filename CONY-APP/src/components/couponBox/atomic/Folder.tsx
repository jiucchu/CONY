import React from 'react';
import styled from 'styled-components/native';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';

const Container = styled.TouchableOpacity`
  position: relative;
  width: 80px;
  aspect-ratio: 1.4;
`;

const FolderTab = styled.View<{ type: 'selected' | 'unselected' }>`
  position: absolute;
  top: -8px;
  width: 50px;
  height: 20px;
  background-color: ${(props) => 
    props.type === 'selected' ? COLORS.primary : COLORS.background.lightGray};
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  z-index: 0;
`;

const FolderBody = styled.View<{ type: 'selected' | 'unselected' }>`
  z-index: 1;
  width: 100%;
  height: 100%;
  padding: 10px;
  border-radius: 16px;
  justify-content: flex-end;
  background-color: ${(props) => 
    props.type === 'selected' ? COLORS.primary : COLORS.background.gray};
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  elevation: 3;
`;

const FolderText = styled.View`
  align-items: center;
  width: 60%;
  gap: 4px;
`;

interface FolderProps {
  type?: 'selected' | 'unselected';
  title?: string;
  onPress?: () => void;
  onLongPress?: () => void;
}

const Folder = ({ type = 'selected', title, onPress, onLongPress }: FolderProps) => {
  const displayTitle = title && title.length > 7 ? `${title.substring(0, 7)}...` : title;
  
  return (
    <Container 
      onPress={onPress} 
      onLongPress={onLongPress}
      activeOpacity={0.9}
    >
      <FolderTab type={type} />
      <FolderBody type={type}>
        <FolderText>
          <StyledText fontSize={12} fontWeight={600} color={COLORS.text.white}>
            {displayTitle}
          </StyledText>
        </FolderText>
      </FolderBody>
    </Container>
  );
};

export default Folder;
