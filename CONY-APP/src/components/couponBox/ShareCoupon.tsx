import React from 'react';
import styled from 'styled-components/native';
import Clipboard from '@react-native-clipboard/clipboard';
import { COLORS } from '../../constants/colors';
import { StyledText } from '../../utils/StyledText';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

interface ShareCouponProps {
  invitationCode?: string;
  invitedCount?: number;
  onShareClick?: () => void;
  onEditClick?: () => void;
  onCopyClick?: () => void;
}

const EditIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={COLORS.text.primary} strokeWidth={2}>
    <Path d="M12 20h9" />
    <Path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </Svg>
);

const CopyIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={COLORS.text.primary} strokeWidth={2}>
    <Rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
);

const CardContainer = styled.View`
  width: 90%;
  background-color: ${COLORS.white};
  border-radius: 12px;
  padding-vertical: 10px;
  padding-horizontal: 20px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.08;
  shadow-radius: 8px;
  elevation: 2;
`;

const Section = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const IconGroup = styled.View`
  flex-direction: row;
  align-items: center;
  position: relative;
`;

const ProfileIcon = styled.View<{ index: number }>`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: gray;
  border-width: 2px;
  border-color: ${COLORS.white};
  position: relative;
  margin-left: ${props => props.index > 0 ? '-8px' : '0px'};
  z-index: ${props => 3 - props.index};
  overflow: hidden;
`;

const ProfileImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const IconButton = styled.TouchableOpacity`
  padding: 4px;
  justify-content: center;
  align-items: center;
`;

const CodeText = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const ShareCoupon: React.FC<ShareCouponProps> = ({
  invitationCode = 'AD21F8',
  invitedCount = 0,
  onShareClick,
  onEditClick,
  onCopyClick,
}) => {
  const handleCopy = async () => {
    if (invitationCode) {
      await Clipboard.setString(invitationCode);
    }
    onCopyClick?.();
  };

  const displayCount = Math.min(invitedCount, 3);
  const profileIcons = [
    'https://via.placeholder.com/150',
    'https://via.placeholder.com/150',
    'https://via.placeholder.com/150',
  ];

  return (
    <CardContainer>
      <Section onPress={onShareClick} activeOpacity={0.7}>
        <StyledText fontSize={16} fontWeight={600} color={COLORS.primary}>
          공유
        </StyledText>
        <IconGroup>
          {profileIcons.slice(0, displayCount).map((profile, index) => (
            <ProfileIcon key={index} index={index}>
              <ProfileImage source={{ uri: profile }} />
            </ProfileIcon>
          ))}
        </IconGroup>
        <IconButton
          onPress={(e) => {
            e.stopPropagation();
            onEditClick?.();
          }}
          activeOpacity={0.7}
        >
          <EditIcon />
        </IconButton>
      </Section>

      <Section onPress={handleCopy} activeOpacity={0.7}>
        <StyledText fontSize={14} fontWeight={400} color={COLORS.text.secondary}>
          초대 코드
        </StyledText>
        <CodeText>
          <StyledText fontSize={16} fontWeight={700} color={COLORS.text.primary}>
            {invitationCode}
          </StyledText>
        </CodeText>
        <IconButton
          onPress={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
          activeOpacity={0.7}
        >
          <CopyIcon />
        </IconButton>
      </Section>
    </CardContainer>
  );
};

export default ShareCoupon;
