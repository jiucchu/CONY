'use client';

import styled from 'styled-components';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';
import { GifticonDetailResponseDto, GifticonUsageLogResponseDto, GifticonType } from '@/types/gifticon/gifticon';
import { getUserInfo } from '@/mockDB/mock';
import { useState } from 'react';
import { updateUseLog, cancelUseGifticon } from '@/api/gifticon/gifticonApi';

interface ExtendedUsageLog extends GifticonUsageLogResponseDto {
  userId?: number;
  userNickname?: string;
}

// 금액권 정보를 위한 공통 인터페이스
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

const CardContainer = styled.div`
  width: 90%;
  background-color: ${COLORS.white};
  border-radius: 10px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);
`;

const SummarySection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 20px;
  border-bottom: 1px solid ${COLORS.background.lightGray};
`;

const TransactionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TransactionItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const TransactionLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const TransactionRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AmountDateRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SummaryItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const IconButton = styled.button<{ $disabled?: boolean }>`
  background: none;
  border: none;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.$disabled ? 0.3 : 1};
  transition: opacity 0.2s;

  &:hover {
    opacity: ${props => props.$disabled ? 0.3 : 0.7};
  }

  svg {
    width: 16px;
    height: 16px;
    stroke: ${COLORS.text.primary};
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;

const EditIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
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
  const currentUser = getUserInfo();
  const [editingLogId, setEditingLogId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');

  // gifticon 또는 coupon에서 데이터 추출
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

  // 데이터가 없으면 null 반환
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
      // 수정 완료
      try {
        const newAmount = parseFloat(editAmount);
        if (isNaN(newAmount) || newAmount <= 0) {
          alert('올바른 금액을 입력해주세요.');
          return;
        }
        await updateUseLog(logId, { newAmount });
        setEditingLogId(null);
        setEditAmount('');
        onUpdate?.();
      } catch (error) {
        console.error('사용 내역 수정 실패:', error);
        alert('사용 내역 수정에 실패했습니다.');
      }
    } else {
      // 수정 모드 진입
      setEditingLogId(logId);
      setEditAmount(currentAmount.toString());
    }
  };

  const handleDelete = async (logId: number) => {
    if (!confirm('정말 이 사용 내역을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await cancelUseGifticon(logId);
      onUpdate?.();
    } catch (error) {
      console.error('사용 내역 삭제 실패:', error);
      alert('사용 내역 삭제에 실패했습니다.');
    }
  };

  const canEditOrDelete = (log: ExtendedUsageLog): boolean => {
    return log.userId === currentUser.user_id || log.userId === undefined;
  };

  return (
    <CardContainer>
      <SummarySection>
        <SummaryItem>
          <StyledText    fontSize={14} fontWeight={800} color={COLORS.text.secondary}>
            사용금액
          </StyledText>
          <StyledText fontSize={28} fontWeight={700} color={COLORS.text.primary}>
            {usedAmount.toLocaleString()}
          </StyledText>
        </SummaryItem>
        <SummaryItem>
          <StyledText fontSize={14} fontWeight={800} color={COLORS.primary}>
            잔여금액
            </StyledText>
          <StyledText fontSize={28} fontWeight={700} color={COLORS.text.primary}>
            {currentBalance.toLocaleString()}
          </StyledText>
        </SummaryItem>
      </SummarySection>

      <TransactionList>
        {extendedHistories.map((log) => {
          const canEdit = canEditOrDelete(log);
          const isEditing = editingLogId === log.logId;

          return (
            <TransactionItem key={log.logId}>
              <TransactionLeft>
                <AmountDateRow>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      style={{
                        width: '100px',
                        padding: '4px 8px',
                        border: `1px solid ${COLORS.background.lightGray}`,
                        borderRadius: '4px',
                        fontSize: '18px',
                        fontWeight: 700,
                      }}
                    />
                  ) : (
                    <StyledText fontSize={18} fontWeight={700} color={COLORS.text.primary}>
                      {log.usedAmount.toLocaleString()}
                    </StyledText>
                  )}
                  <StyledText fontSize={12} fontWeight={300} color={COLORS.text.secondary}>
                    {formatDate(log.usedAt)}
                  </StyledText>
                </AmountDateRow>
                <StyledText fontSize={14} fontWeight={900} color={COLORS.text.secondary}>
                  {log.userNickname || '닉네임이 없습니다.'}
                </StyledText>
              </TransactionLeft>
              <TransactionRight>
                {canEdit && (
                  <>
                    <IconButton
                      onClick={() => handleEdit(log.logId, log.usedAmount)}
                      aria-label="수정"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(log.logId)}
                      aria-label="삭제"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </>
                )}
              </TransactionRight>
            </TransactionItem>
          );
        })}
      </TransactionList>
    </CardContainer>
  );
};

export default RemainMoneyCard;