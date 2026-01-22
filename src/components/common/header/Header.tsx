'use client';

import styled from "styled-components";
import { COLORS } from "@/constants/colors";
import { StyledText } from "@/utils/StyledText";
import { ReactNode } from "react";

const HeaderContainer = styled.div<{ type: 'default' | 'back'; isAtTop: boolean }>`
  background: transparent;
  width: 100%;
  padding: 13px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: ${props => props.type === 'back' ? 'relative' : 'static'};
  transition: background 0.3s ease;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const IconButton = styled.button<{ isAtTop: boolean }>`
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
  z-index: 1;
  background: transparent;

  &:hover {
    opacity: 0.7;
  }

  svg {
    width: 24px;
    height: 24px;
    stroke: ${props => props.isAtTop ? COLORS.white : COLORS.text.primary};
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: stroke 0.3s ease;
  }
`;

const TitleContainer = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BellIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const BackIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </svg>
);

interface HeaderProps {
  type?: 'default' | 'back';
  title?: ReactNode;
  onBack?: () => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  isAtTop?: boolean;
}

const Header = ({ 
  type = 'default',
  title,
  onBack,
  onNotificationClick,
  onProfileClick,
  isAtTop = false
}: HeaderProps) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      if (typeof window !== 'undefined') {
        window.history.back();
      }
    }
  };

  const handleNotificationClick = () => {
    if (onNotificationClick) {
      onNotificationClick();
    } else {
      console.log('Notification clicked');
    }
  };

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    } else {
      console.log('Profile clicked');
    }
  };

  if (type === 'back') {
    return (
      <HeaderContainer type={type} isAtTop={isAtTop}>
        <IconButton isAtTop={isAtTop} onClick={handleBack} aria-label="뒤로가기">
          <BackIcon />
        </IconButton>
        {title && (
          <TitleContainer>
            <StyledText fontSize={18} fontWeight={600} color={isAtTop ? COLORS.white : COLORS.text.primary}>
              {title}
            </StyledText>
          </TitleContainer>
        )}
        <div style={{ width: '24px' }} />
      </HeaderContainer>
    );
  }

  return (
    <HeaderContainer type={type} isAtTop={isAtTop}>
      <StyledText fontSize={20} fontWeight={900} color={isAtTop ? COLORS.white : COLORS.text.primary}>CONY</StyledText>
      <IconContainer>
        <IconButton isAtTop={isAtTop} onClick={handleNotificationClick} aria-label="알림">
          <BellIcon />
        </IconButton>
        <IconButton isAtTop={isAtTop} onClick={handleProfileClick} aria-label="프로필">
          <UserIcon />
        </IconButton>
      </IconContainer>
    </HeaderContainer>
  );
};

export default Header;
