import React from 'react';
import styled from 'styled-components/native';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';

const Button = styled.TouchableOpacity`
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background-color: ${COLORS.primary};
  padding: 10px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;   
`;

interface AddProductButtonProps {
  onPress: () => void;
}

const AddProductButton = ({ onPress }: AddProductButtonProps) => {
  return (
    <Button onPress={onPress}>
      <StyledText fontSize={16} fontWeight={700} color={COLORS.white}>
        상품 추가
      </StyledText>
    </Button>
  );
};

export default AddProductButton;
