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
  background-color: ${COLORS.white};

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.98);
    opacity: 0.85;
  }
`;

interface LogoutButtonProps {
  onClick?: () => void;
}

const LogoutButton = ({ onClick }: LogoutButtonProps) => {
  return (
    <ButtonContainer onClick={onClick} aria-label="로그아웃">
      <StyledText fontSize={16} fontWeight={600} color={COLORS.text.primary}>
        로그아웃
      </StyledText>
    </ButtonContainer>
  );
};

export default LogoutButton;
