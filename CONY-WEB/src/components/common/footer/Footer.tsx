'use client';

import styled from "styled-components";
import { COLORS } from "@/constants/colors";
import { StyledText } from "@/utils/StyledText";

const FooterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 1000;
  pointer-events: none;
`;

const FooterContent = styled.div`
  width: 100%;
  background-color: ${COLORS.white};
  border-radius: 20px 20px 0 0;
  padding: 16px 20px 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  position: relative;
  box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.1);
  pointer-events: auto;
`;

const NavItem = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }
`;

const NavIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 100%;
    height: 100%;
    stroke: ${COLORS.text.primary};
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;

const CentralButton = styled.button`
  position: absolute;
  top: -30px;
  left: 50%;
  border: 4px solid ${COLORS.white};
  transform: translateX(-50%);
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: ${COLORS.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0px 4px 12px ${COLORS.background.lightGray};
  transition: transform 0.2s, box-shadow 0.2s;
  z-index: 10;

  &:hover {
    transform: translateX(-50%) scale(1.05);
    box-shadow: 0px 6px 16px rgba(244, 81, 132, 0.5);
  }

  &:active {
    transform: translateX(-50%) scale(0.95);
  }

  svg {
    width: 28px;
    height: 28px;
    stroke: ${COLORS.white};
    fill: none;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CardIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const BagIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const Footer = () => {
  const handleCouponBoxClick = () => {
    console.log('내 쿠폰함 clicked');
  };

  const handleAddClick = () => {
    console.log('추가 버튼 clicked');
  };

  const handleExchangeClick = () => {
    console.log('콘 거래소 clicked');
  };

  return (
    <FooterContainer>
      <FooterContent>
        <NavItem onClick={handleCouponBoxClick}>
          <NavIcon>
            <CardIcon />
          </NavIcon>
          <StyledText fontSize={12} fontWeight={500} color={COLORS.text.primary}>
            내 쿠폰함
          </StyledText>
        </NavItem>

        <CentralButton onClick={handleAddClick} aria-label="추가">
          <PlusIcon />
        </CentralButton>

        <NavItem onClick={handleExchangeClick}>
          <NavIcon>
            <BagIcon />
          </NavIcon>
          <StyledText fontSize={12} fontWeight={500} color={COLORS.text.primary}>
            콘 거래소
          </StyledText>
        </NavItem>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;
