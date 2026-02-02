import React from 'react';
import styled from 'styled-components/native';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';

const Container = styled.View`
  padding: 60px 20px;
  align-items: center;
  justify-content: center;
`;

interface EmptyStateProps {
  message: string;
}

const EmptyState = ({ message }: EmptyStateProps) => {
  return (
    <Container>
      <StyledText fontSize={14} fontWeight={400} color={COLORS.text.secondary}>
        {message}
      </StyledText>
    </Container>
  );
};

export default EmptyState;
