'use client';

import styled from 'styled-components';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';
import { getUserInfo } from '@/api/user/userApi';
import { useEffect, useState } from 'react';
import { UserInfo } from '@/types/user/user';

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
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const data = await getUserInfo();
        setUserInfo(data);
      } catch (err: any) {
        // 사용자 정보 조회 실패는 조용히 처리
        // API가 아직 구현되지 않았을 수 있음
        if (err?.message?.includes('404') || err?.message?.includes('Not Found')) {
          // API가 없는 경우 기본값 사용
          setUserInfo({
            user_id: 0,
            name: '사용자',
            email: '',
            balance: 0,
          });
        } else {
          // 다른 에러는 조용히 처리하고 기본값 사용
          setUserInfo({
            user_id: 0,
            name: '사용자',
            email: '',
            balance: 0,
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, []);

  if (loading) {
    return (
      <CardContainer>
        <StyledText fontSize={14} fontWeight={400} color={COLORS.text.secondary}>
          로딩 중...
        </StyledText>
      </CardContainer>
    );
  }

  // userInfo가 없으면 기본값 사용
  const displayUserInfo = userInfo || {
    user_id: 0,
    name: '사용자',
    email: '',
    balance: 0,
  };

  const formattedBalance = displayUserInfo.balance.toLocaleString();

  return (
    <CardContainer>
      <AvatarPlaceholder />
      <InfoSection>
        <NameEmailContainer>
          <StyledText fontSize={18} fontWeight={700} color={COLORS.text.primary}>
            {displayUserInfo.name}
          </StyledText>
          {displayUserInfo.email && (
            <StyledText fontSize={14} fontWeight={400} color={COLORS.text.secondary}>
              {displayUserInfo.email}
            </StyledText>
          )}
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