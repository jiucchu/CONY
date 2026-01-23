import React from 'react';
import styled from 'styled-components/native';
import { COLORS } from '../../../constants/colors';
import { StyledText } from '../../../utils/StyledText';
import Svg, { Path, Circle } from 'react-native-svg';

const BellIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.text.primary} strokeWidth={2}>
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Svg>
);

const UserIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.text.primary} strokeWidth={2}>
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

const HeaderContainer = styled.View`
  width: 100%;
  padding-vertical: 13px;
  padding-horizontal: 20px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-bottom-width: 1px;
  border-bottom-color: ${COLORS.background.lightGray};
`;

const IconContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

const IconButton = styled.TouchableOpacity`
  padding: 4px;
  justify-content: center;
  align-items: center;
`;

const Header: React.FC = () => {
  const handleNotificationClick = () => {
    console.log('Notification clicked');
  };

  const handleProfileClick = () => {
    console.log('Profile clicked');
  };

  return (
    <HeaderContainer>
      <StyledText fontSize={20} fontWeight={900} color={COLORS.text.primary}>
        CONY
      </StyledText>
      <IconContainer>
        <IconButton
          onPress={handleNotificationClick}
          activeOpacity={0.7}
        >
          <BellIcon />
        </IconButton>
        <IconButton
          onPress={handleProfileClick}
          activeOpacity={0.7}
        >
          <UserIcon />
        </IconButton>
      </IconContainer>
    </HeaderContainer>
  );
};

export default Header;
