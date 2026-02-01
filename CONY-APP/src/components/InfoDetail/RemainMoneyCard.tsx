import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';
import { GifticonDetailResponseDto, GifticonUsageLogResponseDto, GifticonType } from '@/types/gifticon/gifticon';
import { getUserInfo } from '@/api/user/userApi';
import { updateUseLog, cancelUseGifticon, useGifticon } from '@/api/gifticon/gifticonApi';
import { UserInfo } from '@/types/user/user';
import { Svg, Path, Line } from 'react-native-svg';
import AmountInputModal from '@/components/common/atomic/AmountInputModal';

interface ExtendedUsageLog extends GifticonUsageLogResponseDto {
  userId?: number;
  userNickname?: string;
}

interface PrepaidCardData {
  type?: GifticonType;
  currentBalance?: number;
  price: number;
  histories?: GifticonUsageLogResponseDto[];
}

interface RemainMoneyCardProps {
  gifticon?: GifticonDetailResponseDto;
  coupon?: GifticonDetailResponseDto;
  onUpdate?: () => void;
  gifticonId?: number;
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 24,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background.lightGray,
  },
  transactionList: {
    gap: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  transactionLeft: {
    flex: 1,
    gap: 4,
  },
  transactionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amountDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  iconButton: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  useButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginTop: 8,
  },
});

const EditIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={COLORS.text.primary} strokeWidth={2}>
    <Path d="M12 20h9" />
    <Path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </Svg>
);

const DeleteIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={COLORS.text.primary} strokeWidth={2}>
    <Line x1="18" y1="6" x2="6" y2="18" />
    <Line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
);

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = String(date.getFullYear()).slice(2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day}/${hours}:${minutes}`;
};

const RemainMoneyCard = ({ gifticon, coupon, onUpdate, gifticonId }: RemainMoneyCardProps) => {
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [useAmount, setUseAmount] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLog, setEditingLog] = useState<ExtendedUsageLog | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await getUserInfo();
        setCurrentUser(userInfo);
      } catch (err) {
        console.error('사용자 정보 조회 실패:', err);
      }
    };
    fetchUserInfo();
  }, []);

  const cardData: PrepaidCardData | null = gifticon
    ? {
        type: gifticon.gifticonType,
        currentBalance: gifticon.currentBalance,
        price: gifticon.originalPrice,
        histories: gifticon.histories,
      }
    : coupon
    ? {
        type: coupon.gifticonType,
        currentBalance: coupon.currentBalance,
        price: coupon.originalPrice,
        histories: coupon.histories,
      }
    : null;

  if (!cardData) {
    return null;
  }

  const originalPrice = cardData.price || 0;
  // currentBalance가 없으면 originalPrice를 기본값으로 사용 (금액권은 항상 잔액이 있어야 함)
  const currentBalance = cardData.currentBalance !== undefined && cardData.currentBalance !== null 
    ? cardData.currentBalance 
    : originalPrice;
  const histories = cardData.histories || [];
  
  // 사용금액 계산: originalPrice - currentBalance (웹 버전과 동일)
  const usedAmount = originalPrice - currentBalance;

  const extendedHistories: ExtendedUsageLog[] = histories.map(log => ({
    ...log,
    userId: undefined,
    userNickname: '사용자닉네임',
  }));

  const handleEdit = (log: ExtendedUsageLog) => {
    setEditingLog(log);
    setEditAmount(log.usedAmount.toString());
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!editingLog) return;

    const newAmount = parseFloat(editAmount);
    if (isNaN(newAmount) || newAmount <= 0) {
      Alert.alert('오류', '올바른 금액을 입력해주세요.');
      return;
    }

    if (newAmount === editingLog.usedAmount) {
      setShowEditModal(false);
      setEditingLog(null);
      setEditAmount('');
      return;
    }

    Alert.alert(
      '수정 확인',
      `사용 금액을 ${editingLog.usedAmount.toLocaleString('ko-KR')}원에서 ${newAmount.toLocaleString('ko-KR')}원으로 변경하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          onPress: async () => {
            try {
              await updateUseLog(editingLog.logId, { newAmount });
              Alert.alert('알림', '사용 금액이 수정되었습니다.');
              setShowEditModal(false);
              setEditingLog(null);
              setEditAmount('');
              onUpdate?.();
            } catch (error: any) {
              console.error('사용 내역 수정 실패:', error);
              Alert.alert(
                '오류',
                `사용 내역 수정에 실패했습니다. ${error?.message || '알 수 없는 오류가 발생했습니다.'}`
              );
            }
          },
        },
      ]
    );
  };

  const handleDelete = async (logId: number) => {
    Alert.alert(
      '삭제 확인',
      '정말 이 사용 내역을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelUseGifticon(logId);
              Alert.alert('알림', '사용 내역이 삭제되었습니다.');
              onUpdate?.();
            } catch (error: any) {
              console.error('사용 내역 삭제 실패:', error);
              Alert.alert('오류', `사용 내역 삭제에 실패했습니다. ${error?.message || '알 수 없는 오류가 발생했습니다.'}`);
            }
          },
        },
      ]
    );
  };

  const handlePartialUse = () => {
    setShowAmountModal(true);
  };

  const handleAmountSubmit = async () => {
    if (!gifticonId) {
      Alert.alert('오류', '기프티콘 ID가 없습니다.');
      return;
    }

    const amount = parseFloat(useAmount);
    
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('오류', '올바른 금액을 입력해주세요.');
      return;
    }

    if (amount > currentBalance) {
      Alert.alert(
        '오류',
        `사용 가능한 금액을 초과했습니다.\n현재 잔액: ${currentBalance.toLocaleString('ko-KR')}원`
      );
      return;
    }

    Alert.alert(
      '사용 확인',
      `${amount.toLocaleString('ko-KR')}원을 사용하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          onPress: async () => {
            try {
              await useGifticon(gifticonId, { amount });
              Alert.alert('알림', '금액 사용 처리되었습니다.');
              setShowAmountModal(false);
              setUseAmount('');
              onUpdate?.();
            } catch (error: any) {
              console.error('금액 사용 처리 실패:', error);
              Alert.alert(
                '오류',
                `금액 사용 처리에 실패했습니다. ${error?.message || '알 수 없는 오류가 발생했습니다.'}`
              );
            }
          },
        },
      ]
    );
  };

  const canEditOrDelete = (log: ExtendedUsageLog): boolean => {
    return log.userId === currentUser?.user_id || log.userId === undefined;
  };

  return (
    <View style={styles.container}>
      <View style={styles.summarySection}>
        <View style={styles.summaryItem}>
          <StyledText fontSize={14} fontWeight={800} color={COLORS.text.secondary}>
            사용금액
          </StyledText>
          <StyledText fontSize={28} fontWeight={700} color={COLORS.text.primary}>
            {usedAmount.toLocaleString()}
          </StyledText>
        </View>
        <View style={styles.summaryItem}>
          <StyledText fontSize={14} fontWeight={800} color={COLORS.primary}>
            잔여금액
          </StyledText>
          <StyledText fontSize={28} fontWeight={700} color={COLORS.text.primary}>
            {currentBalance.toLocaleString()}
          </StyledText>
        </View>
      </View>

      <View style={styles.transactionList}>
        {extendedHistories.map((log) => {
          const canEdit = canEditOrDelete(log);

          return (
            <View key={log.logId} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <View style={styles.amountDateRow}>
                  <StyledText fontSize={18} fontWeight={700} color={COLORS.text.primary}>
                    {log.usedAmount.toLocaleString()}원
                  </StyledText>
                  <StyledText fontSize={12} fontWeight={300} color={COLORS.text.secondary}>
                    {formatDate(log.usedAt)}
                  </StyledText>
                </View>
                <StyledText fontSize={14} fontWeight={900} color={COLORS.text.secondary}>
                  {log.userNickname || '닉네임이 없습니다.'}
                </StyledText>
              </View>
              <View style={styles.transactionRight}>
                {canEdit && (
                  <>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleEdit(log)}
                    >
                      <EditIcon />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleDelete(log.logId)}
                    >
                      <DeleteIcon />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {currentBalance > 0 && (
        <TouchableOpacity
          style={styles.useButton}
          onPress={handlePartialUse}
          disabled={currentBalance <= 0}
        >
          <StyledText fontSize={15} fontWeight={600} color={COLORS.white}>
            잔액 변경
          </StyledText>
        </TouchableOpacity>
      )}

      {showAmountModal && (
        <AmountInputModal
          currentBalance={currentBalance}
          amount={useAmount}
          onAmountChange={setUseAmount}
          onClose={() => {
            setShowAmountModal(false);
            setUseAmount('');
          }}
          onSubmit={handleAmountSubmit}
        />
      )}

      {showEditModal && editingLog && (
        <AmountInputModal
          currentBalance={originalPrice}
          amount={editAmount}
          onAmountChange={setEditAmount}
          onClose={() => {
            setShowEditModal(false);
            setEditingLog(null);
            setEditAmount('');
          }}
          onSubmit={handleEditSubmit}
          title="사용 금액 수정"
          placeholder="수정할 금액을 입력하세요"
        />
      )}
    </View>
  );
};

export default RemainMoneyCard;
