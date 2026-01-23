'use client';

import styled from "styled-components";
import Folder from "./atomic/Folder";
import { FolderData } from "@/types/coupon/coupon";

const FoldersContainer = styled.div`
  display: flex;
  gap: 20px;
  padding: 40px 0;
  overflow-x: auto;
  overflow-y: hidden;
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
