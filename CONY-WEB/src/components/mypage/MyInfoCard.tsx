'use client';

import styled from 'styled-components';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';
import { getUserInfo } from '@/mockDB/mock';

const CardContainer = styled.div`
  background-color: ${COLORS.white};
  width: 90%;
  border-radius: 12px;
  padding: 3% 5%;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
`;

const AvatarPlaceholder = styled.div`
  width:20%;
  aspect-ratio: 1/1;
  border-radius: 50%;
  background-color: ${COLORS.background.lightGray};
`;

const InfoSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const NameEmailContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BalanceContainer = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
`;

const EditButton = styled.button`
  background-color: ${COLORS.primary};
  justify-content: center;
  align-items: center;
  border: none;
  width: 80px;
  height: 30px;
  border-radius: 20px;
  cursor: pointer;
  transition: opacity 0.2s;
  flex-shrink: 0;

  &:hover {
    opacity: 0.9;
  }
`;

const MyInfoCard = () => {
  const userInfo = getUserInfo();
  const formattedBalance = userInfo.balance.toLocaleString();

  return (
    <CardContainer>
      <AvatarPlaceholder />
      <InfoSection>
        <NameEmailContainer>
          <StyledText fontSize={18} fontWeight={700} color={COLORS.text.primary}>
            {userInfo.name}
          </StyledText>
          <StyledText fontSize={14} fontWeight={400} color={COLORS.text.secondary}>
            {userInfo.email}
          </StyledText>
        </NameEmailContainer>
        <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: '8px' }}>
            <BalanceContainer>
            <StyledText fontSize={24} fontWeight={700} color={COLORS.text.primary}>
                {formattedBalance}
            </StyledText>
            <StyledText fontSize={24} fontWeight={700} color={COLORS.primary}>
                C
            </StyledText>
            </BalanceContainer>
            <EditButton>
                <StyledText fontSize={10} fontWeight={700} color={COLORS.white}>
                    정보 수정
                </StyledText>
            </EditButton>
        </div>
      </InfoSection>

    </CardContainer>
  );
};

export default MyInfoCard;