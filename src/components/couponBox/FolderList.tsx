'use client';

import styled from "styled-components";
import Folder from "./atomic/Folder";

const FoldersContainer = styled.div`
  display: flex;
  gap: 20px;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 8px;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  > * {
    flex-shrink: 0;
  }
  
  > *:first-child {
    margin-left: 6%;
  }
  
  > *:last-child {
    margin-right: 6%;
  }
`;

interface FolderData {
  id: string;
  title: string;
  type: 'selected' | 'unselected';
}

interface FolderListProps {
  folders: FolderData[];
  onFolderClick?: (folderId: string) => void;
}

const FolderList = ({ folders, onFolderClick }: FolderListProps) => {
  const handleFolderClick = (folderId: string) => {
    onFolderClick?.(folderId);
  };

  return (
    <FoldersContainer>
      {folders.map((folder) => (
        <Folder
          key={folder.id}
          type={folder.type}
          title={folder.title}
          onClick={() => handleFolderClick(folder.id)}
        />
      ))}
    </FoldersContainer>
  );
};

export default FolderList;
