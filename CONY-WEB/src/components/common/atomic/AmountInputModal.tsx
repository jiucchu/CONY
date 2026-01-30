'use client';

import React from 'react';
import styled from 'styled-components';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: ${COLORS.white};
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid ${COLORS.background.lightGray};
  border-radius: 8px;
  font-size: 16px;
  font-family: 'Pretendard', sans-serif;
  text-align: right;
  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const StyledButton = styled.button<{ $primary?: boolean }>`
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-family: 'Pretendard', sans-serif;
  font-size: 15px;
  font-weight: 600;
  background-color: ${props => props.$primary ? COLORS.primary : COLORS.background.lightGray};
  color: ${props => props.$primary ? COLORS.white : COLORS.text.secondary};
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

interface AmountInputModalProps {
  currentBalance: number;
  amount: string;
  onAmountChange: (amount: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  title?: string;
  placeholder?: string;
}

const AmountInputModal = ({
  currentBalance,
  amount,
  onAmountChange,
  onClose,
  onSubmit,
  title = '금액 사용',
  placeholder = '사용할 금액을 입력하세요',
}: AmountInputModalProps) => {
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <StyledText fontSize={18} fontWeight={700} color={COLORS.text.primary}>
          {title}
        </StyledText>
        <InputGroup>
          <StyledText fontSize={14} fontWeight={500} color={COLORS.text.secondary}>
            현재 잔액: {currentBalance.toLocaleString('ko-KR')}원
          </StyledText>
          <StyledInput
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder={placeholder}
            min="1"
            max={currentBalance}
          />
        </InputGroup>
        <ButtonGroup>
          <StyledButton onClick={onClose}>취소</StyledButton>
          <StyledButton $primary onClick={onSubmit}>확인</StyledButton>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AmountInputModal;
