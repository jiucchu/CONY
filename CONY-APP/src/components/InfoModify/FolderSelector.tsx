import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';
import { FolderData } from '@/types/coupon/coupon';
import { createRoom } from '@/api/room/roomApi';
import { Svg, Path, Polyline } from 'react-native-svg';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '20%',
    minWidth: 120,
  },
  selectorButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.background.lightGray,
    borderRadius: 24,
  },
  folderIconWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  chevronIcon: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.background.lightGray,
    borderRadius: 12,
    maxHeight: 300,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  dropdownItem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  createRoomModal: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  roomNameInput: {
    borderWidth: 1,
    borderColor: COLORS.background.lightGray,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: COLORS.text.primary,
    marginBottom: 20,
  },
  createRoomButtonGroup: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  createRoomButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.background.lightGray,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
});

const FolderIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 7C3 5.89543 3.89543 5 5 5H9.58579C9.851 5 10.1054 5.10536 10.2929 5.29289L12.7071 7.70711C12.8946 7.89464 13.149 8 13.4142 8H19C20.1046 8 21 8.89543 21 10V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z"
      fill={COLORS.primary}
    />
  </Svg>
);

const ChevronDown = ({ isOpen }: { isOpen: boolean }) => (
  <Svg
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke={COLORS.text.secondary}
    strokeWidth={2}
    style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
  >
    <Polyline points="6 9 12 15 18 9" />
  </Svg>
);

interface FolderSelectorProps {
  folders: FolderData[];
  selectedFolderId?: string;
  onSelect?: (folderId: string) => void;
  onRoomCreated?: () => void; // 공유방 생성 후 목록 새로고침 콜백
  placeholder?: string;
}

const FolderSelector = ({
  folders,
  selectedFolderId,
  onSelect,
  onRoomCreated,
  placeholder = '기본 폴더',
}: FolderSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  const selectedFolder = folders.find(f => f.id === selectedFolderId) || folders[0];
  const displayText = selectedFolder?.title || placeholder;

  const handleSelect = (folderId: string) => {
    onSelect?.(folderId);
    setIsOpen(false);
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      Alert.alert('알림', '공유방 이름을 입력해주세요.');
      return;
    }

    try {
      await createRoom({ name: newRoomName.trim() });
      Alert.alert('알림', '공유방이 생성되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            setIsCreateModalOpen(false);
            setNewRoomName('');
            setIsOpen(false);
            onRoomCreated?.(); // 목록 새로고침
          },
        },
      ]);
    } catch (error: any) {
      console.error('공유방 생성 실패:', error);
      Alert.alert('오류', `공유방 생성에 실패했습니다.\n${error?.message || '알 수 없는 오류가 발생했습니다.'}`);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.selectorButton} onPress={() => setIsOpen(true)}>
        <View style={styles.folderIconWrapper}>
          <FolderIcon />
        </View>
        <View style={styles.textContainer}>
          <StyledText fontSize={14} fontWeight={400} color={COLORS.text.primary}>
            {displayText}
          </StyledText>
        </View>
        <View style={styles.chevronIcon}>
          <ChevronDown isOpen={isOpen} />
        </View>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.dropdownMenu}
            onPress={(e) => e.stopPropagation()}
          >
            {folders.map((folder) => (
              <TouchableOpacity
                key={folder.id}
                style={styles.dropdownItem}
                onPress={() => handleSelect(folder.id)}
              >
                <View style={styles.folderIconWrapper}>
                  <FolderIcon />
                </View>
                <View style={styles.textContainer}>
                  <StyledText fontSize={14} fontWeight={400} color={COLORS.text.primary}>
                    {folder.title}
                  </StyledText>
                </View>
              </TouchableOpacity>
            ))}
            {/* 새 공유방 만들기 버튼 */}
            <TouchableOpacity
              style={[styles.dropdownItem, { borderTopWidth: 1, borderTopColor: COLORS.background.lightGray }]}
              onPress={() => {
                setIsOpen(false);
                setIsCreateModalOpen(true);
              }}
            >
              <View style={styles.folderIconWrapper}>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth={2}>
                  <Path d="M12 5v14M5 12h14" />
                </Svg>
              </View>
              <View style={styles.textContainer}>
                <StyledText fontSize={14} fontWeight={600} color={COLORS.primary}>
                  새 공유방 만들기
                </StyledText>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* 공유방 생성 모달 */}
      <Modal
        visible={isCreateModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCreateModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsCreateModalOpen(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.createRoomModal}
            onPress={(e) => e.stopPropagation()}
          >
            <StyledText fontSize={18} fontWeight={700} color={COLORS.text.primary} style={{ marginBottom: 16 }}>
              새 공유방 만들기
            </StyledText>
            <TextInput
              style={styles.roomNameInput}
              value={newRoomName}
              onChangeText={setNewRoomName}
              placeholder="공유방 이름을 입력하세요"
              placeholderTextColor={COLORS.text.secondary}
              autoFocus
            />
            <View style={styles.createRoomButtonGroup}>
              <TouchableOpacity
                style={[styles.createRoomButton, styles.cancelButton]}
                onPress={() => {
                  setIsCreateModalOpen(false);
                  setNewRoomName('');
                }}
              >
                <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
                  취소
                </StyledText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createRoomButton, styles.confirmButton]}
                onPress={handleCreateRoom}
              >
                <StyledText fontSize={14} fontWeight={600} color={COLORS.white}>
                  생성
                </StyledText>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default FolderSelector;
