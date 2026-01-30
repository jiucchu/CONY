'use client';

import styled from 'styled-components';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';
import { GifticonDetailResponseDto, GifticonUsageLogResponseDto, GifticonType } from '@/types/gifticon/gifticon';
import { getUserInfo } from '@/api/user/userApi';
import { useState, useEffect } from 'react';
import { updateUseLog, cancelUseGifticon, useGifticon } from '@/api/gifticon/gifticonApi';
import { UserInfo } from '@/types/user/user';
import AmountInputModal from '@/components/common/atomic/AmountInputModal';

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
  gifticonId?: number;
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

const UseButton = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-family: 'Pretendard', sans-serif;
  font-size: 15px;
  font-weight: 600;
  background-color: ${COLORS.primary};
  color: ${COLORS.white};
  transition: opacity 0.2s;
  margin-top: 8px;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RemainMoneyCard = ({ gifticon, coupon, onUpdate, gifticonId }: RemainMoneyCardProps) => {
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [editingLogId, setEditingLogId] = useState<number | null>(null);
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
      } catch (err: any) {
        // 사용자 정보 조회 실패는 조용히 처리
        // 사용자 정보가 없어도 컴포넌트는 정상 동작함
        // (log.userId === undefined 조건으로 인해 수정/삭제 가능)
        // currentUser는 null로 유지되어 기본 동작 수행
      }
    };
    fetchUserInfo();
  }, []);

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

  const handleEdit = (log: ExtendedUsageLog) => {
    setEditingLog(log);
    setEditAmount(log.usedAmount.toString());
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!editingLog) return;

    const newAmount = parseFloat(editAmount);
    if (isNaN(newAmount) || newAmount <= 0) {
      alert('올바른 금액을 입력해주세요.');
      return;
    }

    if (newAmount === editingLog.usedAmount) {
      setShowEditModal(false);
      setEditingLog(null);
      setEditAmount('');
      return;
    }

    if (!window.confirm(`사용 금액을 ${editingLog.usedAmount.toLocaleString('ko-KR')}원에서 ${newAmount.toLocaleString('ko-KR')}원으로 변경하시겠습니까?`)) {
      return;
    }

    try {
      await updateUseLog(editingLog.logId, { newAmount });
      alert('사용 금액이 수정되었습니다.');
      setShowEditModal(false);
      setEditingLog(null);
      setEditAmount('');
      onUpdate?.();
    } catch (error) {
      console.error('사용 내역 수정 실패:', error);
      alert(`사용 내역 수정에 실패했습니다. ${error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'}`);
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
    return log.userId === currentUser?.user_id || log.userId === undefined;
  };

  const handlePartialUse = () => {
    setShowAmountModal(true);
  };

  const handleAmountSubmit = async () => {
    if (!gifticonId) {
      alert('기프티콘 ID가 없습니다.');
      return;
    }

    const amount = parseFloat(useAmount);
    
    if (isNaN(amount) || amount <= 0) {
      alert('올바른 금액을 입력해주세요.');
      return;
    }

    if (amount > currentBalance) {
      alert(`사용 가능한 금액을 초과했습니다.\n현재 잔액: ${currentBalance.toLocaleString('ko-KR')}원`);
      return;
    }

    if (!window.confirm(`${amount.toLocaleString('ko-KR')}원을 사용하시겠습니까?`)) {
      return;
    }

    try {
      await useGifticon(gifticonId, { amount });
      alert('금액 사용 처리되었습니다.');
      
      setShowAmountModal(false);
      setUseAmount('');
      
      onUpdate?.();
    } catch (error) {
      console.error('금액 사용 처리 실패:', error);
      alert(`금액 사용 처리에 실패했습니다. ${error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'}`);
    }
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

          return (
            <TransactionItem key={log.logId}>
              <TransactionLeft>
                <AmountDateRow>
                  <StyledText fontSize={18} fontWeight={700} color={COLORS.text.primary}>
                    {log.usedAmount.toLocaleString()}원
                  </StyledText>
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
                      onClick={() => handleEdit(log)}
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

      {currentBalance > 0 && (
        <UseButton onClick={handlePartialUse} disabled={currentBalance <= 0}>
          잔액 변경
        </UseButton>
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
    </CardContainer>
  );
};

export default RemainMoneyCard;