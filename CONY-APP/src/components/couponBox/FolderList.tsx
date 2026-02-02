import React, { useState } from 'react';
import { ScrollView, Modal, TextInput, Alert } from 'react-native';
import styled from 'styled-components/native';
import Folder from './atomic/Folder';
import { FolderData } from '@/types/coupon/coupon';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';
import { createRoom } from '@/api/room/roomApi';
import { Svg, Path } from 'react-native-svg';

const Container = styled.View`
  flex-direction: row;
  gap: 20px;
  padding-vertical: 20px;
`;

const AddButton = styled.TouchableOpacity`
  width: 80px;
  aspect-ratio: 1.4;
  border-width: 2px;
  border-color: ${COLORS.background.lightGray};
  border-style: dashed;
  border-radius: 16px;
  justify-content: center;
  align-items: center;
  background-color: ${COLORS.white};
`;

const ModalOverlay = styled.TouchableOpacity`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.TouchableOpacity`
  background-color: ${COLORS.white};
  border-radius: 12px;
  padding: 24px;
  width: 80%;
  max-width: 400px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.1;
  shadow-radius: 12px;
  elevation: 5;
`;

const RoomNameInput = styled.TextInput`
  border-width: 1px;
  border-color: ${COLORS.background.lightGray};
  border-radius: 8px;
  padding-vertical: 12px;
  padding-horizontal: 16px;
  font-size: 14px;
  color: ${COLORS.text.primary};
  margin-bottom: 20px;
  margin-top: 12px;
`;

const ButtonGroup = styled.View`
  flex-direction: row;
  gap: 12px;
  justify-content: flex-end;
`;

const ModalButton = styled.TouchableOpacity<{ variant?: 'cancel' | 'confirm' }>`
  padding-vertical: 10px;
  padding-horizontal: 20px;
  border-radius: 8px;
  min-width: 80px;
  align-items: center;
  background-color: ${(props) => 
    props.variant === 'confirm' ? COLORS.primary : COLORS.background.lightGray};
`;

const PlusIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.background.lightGray} strokeWidth={2}>
    <Path d="M12 5v14M5 12h14" />
  </Svg>
);

interface FolderListProps {
  folders: FolderData[];
  onFolderClick?: (folderId: string) => void;
  onFolderLongPress?: (folderId: string) => void;
  onRoomCreated?: () => void; // 공유방 생성 후 목록 새로고침 콜백
}

const FolderList = ({ folders, onFolderClick, onFolderLongPress, onRoomCreated }: FolderListProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  const handleFolderClick = (folderId: string) => {
    onFolderClick?.(folderId);
  };

  const handleFolderLongPress = (folderId: string) => {
    onFolderLongPress?.(folderId);
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
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: '6%', paddingRight: '6%' }}
      >
        <Container>
          {folders.map((folder) => (
            <Folder
              key={folder.id}
              type={folder.type}
              title={folder.title}
              onPress={() => handleFolderClick(folder.id)}
              onLongPress={() => handleFolderLongPress(folder.id)}
            />
          ))}
          {/* 폴더 추가 버튼 */}
          <AddButton
            onPress={() => setIsCreateModalOpen(true)}
            activeOpacity={0.7}
          >
            <PlusIcon />
          </AddButton>
        </Container>
      </ScrollView>

      {/* 공유방 생성 모달 */}
      <Modal
        visible={isCreateModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCreateModalOpen(false)}
      >
        <ModalOverlay
          activeOpacity={1}
          onPress={() => setIsCreateModalOpen(false)}
        >
          <ModalContent
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <StyledText fontSize={18} fontWeight={700} color={COLORS.text.primary}>
              새 공유방 만들기
            </StyledText>
            <RoomNameInput
              value={newRoomName}
              onChangeText={setNewRoomName}
              placeholder="공유방 이름을 입력하세요"
              placeholderTextColor={COLORS.text.secondary}
              autoFocus
            />
            <ButtonGroup>
              <ModalButton
                variant="cancel"
                onPress={() => {
                  setIsCreateModalOpen(false);
                  setNewRoomName('');
                }}
              >
                <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
                  취소
                </StyledText>
              </ModalButton>
              <ModalButton
                variant="confirm"
                onPress={handleCreateRoom}
              >
                <StyledText fontSize={14} fontWeight={600} color={COLORS.white}>
                  생성
                </StyledText>
              </ModalButton>
            </ButtonGroup>
          </ModalContent>
        </ModalOverlay>
      </Modal>
    </>
  );
};

export default FolderList;
