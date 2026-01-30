import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Folder from './atomic/Folder';
import { FolderData } from '@/types/coupon/coupon';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 20,
    paddingVertical: 40,
  },
  scrollContent: {
    paddingLeft: '6%',
    paddingRight: '6%',
  },
});

interface FolderListProps {
  folders: FolderData[];
  onFolderClick?: (folderId: string) => void;
}

const FolderList = ({ folders, onFolderClick }: FolderListProps) => {
  const handleFolderClick = (folderId: string) => {
    onFolderClick?.(folderId);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.container}>
        {folders.map((folder) => (
          <Folder
            key={folder.id}
            type={folder.type}
            title={folder.title}
            onPress={() => handleFolderClick(folder.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
};

export default FolderList;
