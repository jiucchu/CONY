'use client';

import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';
import styled from 'styled-components';
import { useState } from 'react';
import SwitchToggle from '@/components/common/atomic/SwitchToggle';
import kakaoLogo from '@/assets/icons/kakao_icon.svg';
import googleLogo from '@/assets/icons/google_icon.png';

const ConnectAccountContainer = styled.div`
  background-color: ${COLORS.white};
  width: 90%;
  border-radius: 12px;
  overflow: hidden;
`;

const HeaderSection = styled.div`
  background-color: ${COLORS.primary};
  padding: 16px 20px;
  display: flex;
  align-items: center;
  border-radius: 12px 12px 0 0;
`;

const AccountList = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const AccountItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const LogoContainer = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const AccountInfo = styled.div`
  flex: 1;
`;


const ConnectAccount = () => {
  const [isKakaoConnected, setIsKakaoConnected] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(true);

  const handleKakaoToggle = () => {
    setIsKakaoConnected(prev => !prev);
  };

  const handleGoogleToggle = () => {
    setIsGoogleConnected(prev => !prev);
  };

  return (
    <ConnectAccountContainer>
      <HeaderSection>
        <StyledText fontSize={18} fontWeight={700} color={COLORS.white}>
          연결 계정
        </StyledText>
      </HeaderSection>
      <AccountList>
        <AccountItem>
          <LogoContainer>
            <img src={kakaoLogo.src} alt="카카오 로고" />
          </LogoContainer>
          <AccountInfo>
            <StyledText fontSize={16} fontWeight={500} color={COLORS.text.primary}>
              카카오 계정
            </StyledText>
          </AccountInfo>
          <SwitchToggle
            isOn={isKakaoConnected}
            onClick={handleKakaoToggle}
            ariaLabel={`카카오 계정 ${isKakaoConnected ? '연결 해제' : '연결'}`}
          />
        </AccountItem>
        <AccountItem>
          <LogoContainer>
            <img src={googleLogo.src} alt="Google 로고" />
          </LogoContainer>
          <AccountInfo>
            <StyledText fontSize={16} fontWeight={500} color={COLORS.text.primary}>
              Google 계정
            </StyledText>
          </AccountInfo>
          <SwitchToggle
            isOn={isGoogleConnected}
            onClick={handleGoogleToggle}
            ariaLabel={`Google 계정 ${isGoogleConnected ? '연결 해제' : '연결'}`}
          />
        </AccountItem>
      </AccountList>
    </ConnectAccountContainer>
  );
};

export default ConnectAccount;