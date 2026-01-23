import React from 'react';
import styled from 'styled-components/native';
import { COLORS } from '../../../constants/colors';
import { StyledText } from '../../../utils/StyledText';
import Svg, { Path, Rect, Line } from 'react-native-svg';

const PlusIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={COLORS.white} strokeWidth={3}>
    <Line x1="12" y1="5" x2="12" y2="19" />
    <Line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
);

const CardIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.text.primary} strokeWidth={2}>
    <Rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <Line x1="1" y1="10" x2="23" y2="10" />
  </Svg>
);

const BagIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.text.primary} strokeWidth={2}>
    <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <Line x1="3" y1="6" x2="21" y2="6" />
    <Path d="M16 10a4 4 0 0 1-8 0" />
  </Svg>
);

const FooterContainer = styled.View`
  justify-content: center;
  align-items: flex-end;
  z-index: 1000;
`;

const FooterContent = styled.View`
  width: 100%;
  background-color: ${COLORS.white};
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding-top: 16px;
  padding-bottom: 10px;
  padding-horizontal: 20px;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  position: relative;
  shadow-color: #000;
  shadow-offset: 0px -2px;
  shadow-opacity: 0.1;
  shadow-radius: 10px;
  elevation: 10;
`;

const NavItem = styled.TouchableOpacity`
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
`;

const NavIcon = styled.View`
  width: 24px;
  height: 24px;
  justify-content: center;
  align-items: center;
`;

const CentralButton = styled.TouchableOpacity`
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-35px);
  width: 70px;
  height: 70px;
  border-radius: 35px;
  background-color: ${COLORS.primary};
  justify-content: center;
  align-items: center;
  border-width: 4px;
  border-color: ${COLORS.white};
  shadow-color: ${COLORS.background.lightGray};
  shadow-offset: 0px 4px;
  shadow-opacity: 1;
  shadow-radius: 12px;
  elevation: 10;
  z-index: 10;
`;

const Footer: React.FC = () => {
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
        <NavItem onPress={handleCouponBoxClick} activeOpacity={0.7}>
          <NavIcon>
            <CardIcon />
          </NavIcon>
          <StyledText fontSize={12} fontWeight={500} color={COLORS.text.primary}>
            내 쿠폰함
          </StyledText>
        </NavItem>

        <CentralButton onPress={handleAddClick} activeOpacity={0.8}>
          <PlusIcon />
        </CentralButton>

        <NavItem onPress={handleExchangeClick} activeOpacity={0.7}>
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
