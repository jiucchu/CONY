import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';
import { GifticonDetailResponseDto, GifticonUsageLogResponseDto, GifticonType } from '@/types/gifticon/gifticon';
import { getUserInfo } from '@/api/user/userApi';
import { updateUseLog, cancelUseGifticon } from '@/api/gifticon/gifticonApi';
import { UserInfo } from '@/types/user/user';
import { Svg, Path, Line } from 'react-native-svg';

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
  editInput: {
    width: 100,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.background.lightGray,
    borderRadius: 4,
    fontSize: 18,
    fontWeight: '700',
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

const RemainMoneyCard = ({ gifticon, coupon, onUpdate }: RemainMoneyCardProps) => {
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [editingLogId, setEditingLogId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');

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
  const currentBalance = cardData.currentBalance || 0;
  const usedAmount = originalPrice - currentBalance;
  const histories = cardData.histories || [];

  const extendedHistories: ExtendedUsageLog[] = histories.map(log => ({
    ...log,
    userId: undefined,
    userNickname: '사용자닉네임',
  }));

  const handleEdit = async (logId: number, currentAmount: number) => {
    if (editingLogId === logId) {
      try {
        const newAmount = parseFloat(editAmount);
        if (isNaN(newAmount) || newAmount <= 0) {
          Alert.alert('오류', '올바른 금액을 입력해주세요.');
          return;
        }
        await updateUseLog(logId, { newAmount });
        setEditingLogId(null);
        setEditAmount('');
        onUpdate?.();
      } catch (error) {
        console.error('사용 내역 수정 실패:', error);
        Alert.alert('오류', '사용 내역 수정에 실패했습니다.');
      }
    } else {
      setEditingLogId(logId);
      setEditAmount(currentAmount.toString());
    }
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
              onUpdate?.();
            } catch (error) {
              console.error('사용 내역 삭제 실패:', error);
              Alert.alert('오류', '사용 내역 삭제에 실패했습니다.');
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
          const isEditing = editingLogId === log.logId;

          return (
            <View key={log.logId} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <View style={styles.amountDateRow}>
                  {isEditing ? (
                    <TextInput
                      style={styles.editInput}
                      value={editAmount}
                      onChangeText={setEditAmount}
                      keyboardType="numeric"
                    />
                  ) : (
                    <StyledText fontSize={18} fontWeight={700} color={COLORS.text.primary}>
                      {log.usedAmount.toLocaleString()}
                    </StyledText>
                  )}
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
                      onPress={() => handleEdit(log.logId, log.usedAmount)}
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
    </View>
  );
};

export default RemainMoneyCard;
