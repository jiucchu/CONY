'use client';

import styled from 'styled-components';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';

const ButtonContainer = styled.button`
  width: 90%;
  padding: 8px;
  border: 1px solid ${COLORS.background.gray};
  border-radius: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s, transform 0.1s;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.98);
    opacity: 0.85;
  }
`;

interface WithdrawButtonProps {
  onClick?: () => void;
}

const WithdrawButton = ({ onClick }: WithdrawButtonProps) => {
  return (
    <ButtonContainer onClick={onClick} aria-label="회원 탈퇴">
      <StyledText fontSize={16} fontWeight={600} color={COLORS.text.primary}>
        회원 탈퇴
      </StyledText>
    </ButtonContainer>
  );
};

export default WithdrawButton;