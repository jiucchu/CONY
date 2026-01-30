import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 100,
    aspectRatio: 1.4,
  },
  folderTab: (type: 'selected' | 'unselected') => ({
    position: 'absolute',
    top: -8,
    width: 50,
    height: 20,
    backgroundColor: type === 'selected' ? COLORS.primary : COLORS.background.lightGray,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    zIndex: 0,
  }),
  folderBody: {
    zIndex: 1,
    width: '100%',
    height: '100%',
    paddingVertical: '10%',
    paddingHorizontal: '15%',
    borderRadius: 16,
    alignItems: 'flex-end',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  folderText: {
    alignItems: 'center',
    gap: 4,
  },
});

interface FolderProps {
  type?: 'selected' | 'unselected';
  title?: string;
  onPress?: () => void;
}

const Folder = ({ type = 'selected', title, onPress }: FolderProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.folderTab(type)} />
      {type === 'selected' ? (
        <View style={[styles.folderBody, { backgroundColor: COLORS.primary }]}>
          <View style={styles.folderText}>
            <StyledText fontSize={18} fontWeight={600} color={COLORS.text.white}>
              {title}
            </StyledText>
          </View>
        </View>
      ) : (
        <View style={[styles.folderBody, { backgroundColor: COLORS.background.gray }]}>
          <View style={styles.folderText}>
            <StyledText fontSize={18} fontWeight={600} color={COLORS.text.white}>
              {title}
            </StyledText>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Folder;
