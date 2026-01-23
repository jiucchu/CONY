'use client';

import styled from "styled-components";
import { COLORS } from "@/constants/colors";
import { StyledText } from "@/utils/StyledText";

const CardContainer = styled.div`
  width: 90%;
  background-color: ${COLORS.white};
  border-radius: 12px;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.08);
`;

const Section = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ShareSection = styled(Section)`
  cursor: pointer;
  transition: opacity 0.2s;
`;

const InviteSection = styled(Section)`
  cursor: pointer;
  transition: opacity 0.2s;
`;

const IconGroup = styled.div`
  display: flex;
  align-items: center;
  gap: -4px;
  position: relative;
`;

const ProfileIcon = styled.div<{ index: number }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: gray;
  border: 2px solid ${COLORS.white};
  position: relative;
  margin-left: ${props => props.index > 0 ? '-8px' : '0'};
  z-index: ${props => 3 - props.index};
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

  svg {
    width: 20px;
    height: 20px;
    stroke: ${COLORS.text.primary};
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;

const EditIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const CopyIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CodeText = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

interface ShareCouponProps {
  invitationCode?: string;
  invitedCount?: number;
  onShareClick?: () => void;
  onEditClick?: () => void;
  onCopyClick?: () => void;
}

const ShareCoupon = ({ 
  invitationCode = 'AD21F8',
  invitedCount = 0,
  onShareClick,
  onEditClick,
  onCopyClick
}: ShareCouponProps) => {
  const handleCopy = () => {
    if (invitationCode) {
      navigator.clipboard.writeText(invitationCode).catch(() => {
        // 클립보드 복사 실패 시 처리
      });
    }
    onCopyClick?.();
  };

  const displayCount = Math.min(invitedCount, 3);
  const profileIcons = ['https://via.placeholder.com/150', 'https://via.placeholder.com/150', 'https://via.placeholder.com/150'];

  return (
    <CardContainer>
      <ShareSection onClick={onShareClick}>
        <StyledText fontSize={16} fontWeight={600} color={COLORS.primary}>
          공유
        </StyledText>
        <IconGroup>
          {profileIcons.map((profile, index) => (
            <ProfileIcon key={index} index={index} >
              <img src={profile} alt="profile" />
            </ProfileIcon>
          ))}
        </IconGroup>
        <IconButton onClick={(e) => {
          e.stopPropagation();
          onEditClick?.();
        }} aria-label="편집">
          <EditIcon />
        </IconButton>
      </ShareSection>

      <InviteSection onClick={handleCopy}>
        <StyledText fontSize={14} fontWeight={400} color={COLORS.text.secondary}>
          초대 코드
        </StyledText>
        <CodeText>
          <StyledText fontSize={16} fontWeight={700} color={COLORS.text.primary}>
            {invitationCode}
          </StyledText>
        </CodeText>
        <IconButton onClick={(e) => {
          e.stopPropagation();
          handleCopy();
        }} aria-label="복사">
          <CopyIcon />
        </IconButton>
      </InviteSection>
    </CardContainer>
  );
};

export default ShareCoupon;
