import React from 'react';
import styled from 'styled-components/native';
import Folder from './atomic/Folder';
import { FolderData } from '../../types/coupon/coupon';

interface FolderListProps {
  folders: FolderData[];
  onFolderClick?: (folderId: string) => void;
}

const FoldersScrollView = styled.ScrollView`
  flex-grow: 0;
`;

const FoldersContainer = styled.View`
  flex-direction: row;
  gap: 12px;
  padding-vertical: 20px;
  align-items: center;
`;

const FolderWrapper = styled.View<{ isFirst: boolean; isLast: boolean }>`
  flex-shrink: 0;
  margin-left: ${props => props.isFirst ? '2%' : '0px'};
  margin-right: ${props => props.isLast ? '2%' : '0px'};
`;

const FolderList: React.FC<FolderListProps> = ({ folders, onFolderClick }) => {
  const handleFolderClick = (folderId: string) => {
    onFolderClick?.(folderId);
  };

  return (
    <FoldersScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      <FoldersContainer>
        {folders.map((folder) => (
          <FolderWrapper key={folder.id} isFirst={folder.id === '1'} isLast={folder.id === folders.length.toString()}>
            <Folder
              type={folder.type}
              title={folder.title}
              onClick={() => handleFolderClick(folder.id)}
            />
          </FolderWrapper>
        ))}
      </FoldersContainer>
    </FoldersScrollView>
  );
};

export default FolderList;
