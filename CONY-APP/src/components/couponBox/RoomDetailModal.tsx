import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';
import { getRoomDetail } from '@/api/room/roomApi';
import { RoomResponseDto } from '@/types/room/room';
import { Svg, Path, Circle } from 'react-native-svg';

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: '85%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background.lightGray,
  },
  modalBody: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  inviteCodeContainer: {
    backgroundColor: COLORS.background.lightGray,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inviteCode: {
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  copyButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  memberList: {
    gap: 12,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInfo: {
    flex: 1,
  },
  memberRole: {
    marginTop: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
});

const CloseIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.text.primary} strokeWidth={2}>
    <Path d="M18 6L6 18M6 6l12 12" />
  </Svg>
);

interface RoomDetailModalProps {
  visible: boolean;
  roomId: number | null;
  onClose: () => void;
}

const RoomDetailModal = ({ visible, roomId, onClose }: RoomDetailModalProps) => {
  const [roomDetail, setRoomDetail] = useState<RoomResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && roomId) {
      fetchRoomDetail();
    } else {
      setRoomDetail(null);
      setError(null);
    }
  }, [visible, roomId]);

  const fetchRoomDetail = async () => {
    if (!roomId) return;

    try {
      setLoading(true);
      setError(null);
      const detail = await getRoomDetail(roomId);
      setRoomDetail(detail);
    } catch (err: any) {
      console.error('Room 상세 정보 조회 실패:', err);
      setError(err?.message || 'Room 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInviteCode = () => {
    if (roomDetail?.roomCode) {
      // 클립보드 복사 기능은 react-native-clipboard 또는 expo-clipboard 필요
      // 일단 Alert로 표시
      Alert.alert('초대 코드', `초대 코드: ${roomDetail.roomCode}\n\n이 코드를 복사하여 공유하세요.`);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <StyledText fontSize={20} fontWeight={700} color={COLORS.text.primary}>
              공유방 정보
            </StyledText>
            <TouchableOpacity onPress={onClose}>
              <CloseIcon />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {loading && (
              <View style={styles.loadingContainer}>
                <StyledText fontSize={14} fontWeight={400} color={COLORS.text.secondary}>
                  로딩 중...
                </StyledText>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <StyledText fontSize={14} fontWeight={400} color={COLORS.text.error}>
                  {error}
                </StyledText>
              </View>
            )}

            {roomDetail && !loading && !error && (
              <>
                {/* 초대 코드 섹션 */}
                <View style={styles.section}>
                  <View style={styles.sectionTitle}>
                    <StyledText fontSize={16} fontWeight={600} color={COLORS.text.primary}>
                      초대 코드
                    </StyledText>
                  </View>
                  <View style={styles.inviteCodeContainer}>
                    <StyledText fontSize={18} fontWeight={700} color={COLORS.text.primary} style={styles.inviteCode}>
                      {roomDetail.roomCode || '코드 없음'}
                    </StyledText>
                    {roomDetail.roomCode && (
                      <TouchableOpacity style={styles.copyButton} onPress={handleCopyInviteCode}>
                        <StyledText fontSize={12} fontWeight={600} color={COLORS.white}>
                          복사
                        </StyledText>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* 멤버 정보 섹션 */}
                <View style={styles.section}>
                  <View style={styles.sectionTitle}>
                    <StyledText fontSize={16} fontWeight={600} color={COLORS.text.primary}>
                      멤버 ({roomDetail.memberCount}명)
                    </StyledText>
                  </View>
                  <View style={styles.memberList}>
                    {/* TODO: 실제 멤버 목록 API가 있으면 여기에 표시 */}
                    <View style={styles.memberItem}>
                      <View style={styles.memberAvatar}>
                        <StyledText fontSize={16} fontWeight={600} color={COLORS.text.secondary}>
                          ?
                        </StyledText>
                      </View>
                      <View style={styles.memberInfo}>
                        <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
                          멤버 정보
                        </StyledText>
                        <StyledText fontSize={12} fontWeight={400} color={COLORS.text.secondary} style={styles.memberRole}>
                          멤버 목록 API가 필요합니다
                        </StyledText>
                      </View>
                    </View>
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default RoomDetailModal;
