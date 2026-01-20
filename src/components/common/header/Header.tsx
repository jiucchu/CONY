'use client';

import styled from "styled-components";
import { COLORS } from "@/constants/colors";
import { StyledText } from "@/utils/StyledText";

const HeaderContainer = styled.div`
  width: 100%;
  padding: 13px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }

  svg {
    width: 24px;
    height: 24px;
    stroke: ${COLORS.text.primary};
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
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

const Header = () => {
  const handleNotificationClick = () => {
    // 알림 클릭 핸들러
    console.log('Notification clicked');
  };

  const handleProfileClick = () => {
    // 프로필 클릭 핸들러
    console.log('Profile clicked');
  };

  return (
    <HeaderContainer>
      <StyledText fontSize={20} fontWeight={900} color={COLORS.text.primary}>CONY</StyledText>
      <IconContainer>
        <IconButton onClick={handleNotificationClick} aria-label="알림">
          <BellIcon />
        </IconButton>
        <IconButton onClick={handleProfileClick} aria-label="프로필">
          <UserIcon />
        </IconButton>
      </IconContainer>
    </HeaderContainer>
  );
};

export default Header;
