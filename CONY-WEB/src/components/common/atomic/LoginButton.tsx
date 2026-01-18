'use client';

import styled from "styled-components";
import { COLORS } from "@/constants/colors";


const LoginButtonContainer = styled.button<{ color: string }>`
  width: 100%;
  background-color: ${props => props.color};
  border-radius: 100px;
  padding: 14px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
`;

const LoginIconContainer = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const ButtonText = styled.span`
  font-family: 'Pretendard', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: ${COLORS.text.primary};
  flex: 1;
  text-align: center;
`;

interface LoginButtonProps {
  onClick?: () => void;
  iconSrc?: string;
  iconAlt?: string;
  color?: string;
  children?: React.ReactNode;
}

const LoginButton = ({ 
  onClick , 
  iconSrc, 
  iconAlt,
  color,
  children,
}: LoginButtonProps) => {
  return (
    <LoginButtonContainer onClick={onClick} color={color || COLORS.white}>
      <LoginIconContainer>
        {iconSrc && <img src={iconSrc} alt={iconAlt} />}
      </LoginIconContainer>
      <ButtonText>{children}</ButtonText>
    </LoginButtonContainer>
  );
};

export default LoginButton;
