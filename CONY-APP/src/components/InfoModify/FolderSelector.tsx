import React, { useState, useRef, useEffect } from 'react';
import { Modal, TextInput, Alert } from 'react-native';
import styled from 'styled-components/native';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';
import { FolderData } from '@/types/coupon/coupon';
import { createRoom } from '@/api/room/roomApi';
import { Svg, Path, Polyline } from 'react-native-svg';

const Container = styled.View`
  position: relative;
  width: 70%;
  min-width: 120px;
`;

const SelectorButton = styled.TouchableOpacity`
  width: 100%;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding-vertical: 8px;
  padding-horizontal: 10px;
  background-color: ${COLORS.white};
  border-width: 1px;
  border-color: ${COLORS.background.lightGray};
  border-radius: 24px;
`;

const FolderIconWrapper = styled.View`
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
`;

const TextContainer = styled.View`
  flex: 1;
  align-items: flex-start;
`;

const ChevronIcon = styled.View`
  width: 16px;
  height: 16px;
  align-items: center;
  justify-content: center;
`;

const ModalOverlay = styled.TouchableOpacity`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
`;

const DropdownMenu = styled.TouchableOpacity`
  background-color: ${COLORS.white};
  border-width: 1px;
  border-color: ${COLORS.background.lightGray};
  border-radius: 12px;
  max-height: 300px;
  width: 80%;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.1;
  shadow-radius: 12px;
  elevation: 5;
`;

const DropdownItem = styled.TouchableOpacity<{ hasBorder?: boolean }>`
  width: 100%;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding-vertical: 12px;
  padding-horizontal: 16px;
  ${(props) => props.hasBorder && `
    border-top-width: 1px;
    border-top-color: ${COLORS.background.lightGray};
  `}
`;

const CreateRoomModal = styled.TouchableOpacity`
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
`;

const CreateRoomButtonGroup = styled.View`
  flex-direction: row;
  gap: 12px;
  justify-content: flex-end;
`;

const CreateRoomButton = styled.TouchableOpacity<{ variant?: 'cancel' | 'confirm' }>`
  padding-vertical: 10px;
  padding-horizontal: 20px;
  border-radius: 8px;
  min-width: 80px;
  align-items: center;
  background-color: ${(props) => 
    props.variant === 'confirm' ? COLORS.primary : COLORS.background.lightGray};
`;

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
    <Container>
      <SelectorButton onPress={() => setIsOpen(true)}>
        <FolderIconWrapper>
          <FolderIcon />
        </FolderIconWrapper>
        <TextContainer>
          <StyledText fontSize={14} fontWeight={400} color={COLORS.text.primary}>
            {displayText}
          </StyledText>
        </TextContainer>
        <ChevronIcon>
          <ChevronDown isOpen={isOpen} />
        </ChevronIcon>
      </SelectorButton>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <ModalOverlay
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <DropdownMenu
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {folders.map((folder) => (
              <DropdownItem
                key={folder.id}
                onPress={() => handleSelect(folder.id)}
              >
                <FolderIconWrapper>
                  <FolderIcon />
                </FolderIconWrapper>
                <TextContainer>
                  <StyledText fontSize={14} fontWeight={400} color={COLORS.text.primary}>
                    {folder.title}
                  </StyledText>
                </TextContainer>
              </DropdownItem>
            ))}
            {/* 새 공유방 만들기 버튼 */}
            <DropdownItem
              hasBorder
              onPress={() => {
                setIsOpen(false);
                setIsCreateModalOpen(true);
              }}
            >
              <FolderIconWrapper>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth={2}>
                  <Path d="M12 5v14M5 12h14" />
                </Svg>
              </FolderIconWrapper>
              <TextContainer>
                <StyledText fontSize={14} fontWeight={600} color={COLORS.primary}>
                  새 공유방 만들기
                </StyledText>
              </TextContainer>
            </DropdownItem>
          </DropdownMenu>
        </ModalOverlay>
      </Modal>

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
          <CreateRoomModal
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <StyledText fontSize={18} fontWeight={700} color={COLORS.text.primary} style={{ marginBottom: 16 }}>
              새 공유방 만들기
            </StyledText>
            <RoomNameInput
              value={newRoomName}
              onChangeText={setNewRoomName}
              placeholder="공유방 이름을 입력하세요"
              placeholderTextColor={COLORS.text.secondary}
              autoFocus
            />
            <CreateRoomButtonGroup>
              <CreateRoomButton
                variant="cancel"
                onPress={() => {
                  setIsCreateModalOpen(false);
                  setNewRoomName('');
                }}
              >
                <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
                  취소
                </StyledText>
              </CreateRoomButton>
              <CreateRoomButton
                variant="confirm"
                onPress={handleCreateRoom}
              >
                <StyledText fontSize={14} fontWeight={600} color={COLORS.white}>
                  생성
                </StyledText>
              </CreateRoomButton>
            </CreateRoomButtonGroup>
          </CreateRoomModal>
        </ModalOverlay>
      </Modal>
    </Container>
  );
};

export default FolderSelector;
