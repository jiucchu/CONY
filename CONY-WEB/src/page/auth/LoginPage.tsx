'use client';

import { useEffect, useState } from "react";
import styled from "styled-components";
import LoginButton from "@/components/common/atomic/LoginButton";
import { COLORS } from "@/constants/colors";
import appleIcon from "@/assets/icons/apple_icon.svg";
import kakaoIcon from "@/assets/icons/kakao_icon.svg";
import googleIcon from "@/assets/icons/google_icon.png";
import { useRouter } from "next/navigation";
import { isAuthenticated, setTokens } from "@/api/auth";

const LoginPageContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(180deg, ${COLORS.primary} 0%, #FFA4C1 100%);
  border: 1px solid #E5E5E5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  position: relative;
`;

const BrandSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60px;
`;


const FontText = styled.p<{ fontSize: number; fontWeight: number; color: string }>`
  font-family: 'pretendard', sans-serif;
  font-size: ${props => props.fontSize}px;
  color: ${props => props.color};
  margin: 0;
  font-weight: ${props => props.fontWeight};
`;

const LoginButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 17px;
  width: 100%;
  max-width: 320px;
  position: relative;
`;

// OAuth 엔드포인트는 /api/manage 경로를 사용해야 합니다 (백엔드 Swagger 설정 참고)
const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://i14c106.p.ssafy.io/api/manage';

const LoginPage = () => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  // 이미 로그인된 경우 메인으로 리다이렉트
  useEffect(() => {
    // 클라이언트 사이드에서만 체크
    if (typeof window === 'undefined') {
      setIsChecking(false);
      return;
    }

    const authenticated = isAuthenticated();
    
    if (authenticated) {
      // 이미 로그인되어 있으면 메인으로 리다이렉트
      router.replace("/");
      return;
    }
    
    // 로그인 안 되어 있으면 체크 완료
    setIsChecking(false);
  }, [router]);

  // OAuth 콜백 메시지 처리
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'OAUTH_SUCCESS') {
        const { accessToken, refreshToken } = event.data;
        
        setTokens(accessToken, refreshToken);
  
        const iframe = document.getElementById('oauth-iframe');
        if (iframe) iframe.remove();
  
        router.replace("/");
      }
    };
  
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  // URL 파라미터에서 토큰 확인 (OAuth 리다이렉트 후)
  useEffect(() => {
    if (typeof window === 'undefined' || isChecking) return;

    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    const accessToken = urlParams.get('accessToken') || hashParams.get('accessToken');
    const refreshToken = urlParams.get('refreshToken') || hashParams.get('refreshToken');

    if (accessToken) {
      setTokens(accessToken, refreshToken || undefined);
      window.history.replaceState({}, '', '/auth/login');
      router.replace("/");
    }
  }, [router, isChecking]);
  
  const handleLogin = (provider: string) => {
    console.log(`${provider} 로그인 시도 중...`);
  
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
  
    const url = `${API_URL}/oauth2/authorization/${provider}`;
    
    window.open(url, "_blank", `width=${width},height=${height},top=${top},left=${left}`);
  };

  if (isChecking) {
    return (
      <LoginPageContainer>
        <FontText fontSize={16} fontWeight={600} color={COLORS.text.white}>
          확인 중...
        </FontText>
      </LoginPageContainer>
    );
  }

  return (
    <LoginPageContainer>
      <BrandSection>
        <FontText fontSize={20} fontWeight={600} color={COLORS.text.white}>🧚</FontText>
        <FontText fontSize={16} fontWeight={600} color={COLORS.text.white}>나만의 작은 쿠폰 요정</FontText>
        <FontText fontSize={60} fontWeight={800} color={COLORS.text.white}>CONY</FontText>
      </BrandSection>

      <LoginButtonsContainer>
        <LoginButton iconSrc={googleIcon.src} iconAlt="Google" onClick={() => handleLogin("google")}children="Google 계정으로 로그인" />
        <LoginButton iconSrc={appleIcon.src} iconAlt="Apple" onClick={() => console.log("Apple 로그인 미지원")} children="Apple 계정으로 로그인" />
        <LoginButton iconSrc={kakaoIcon.src} iconAlt="Kakao" onClick={() => handleLogin("kakao")} children="Kakao 계정으로 로그인" color="#F7E111"/>
      </LoginButtonsContainer>
    </LoginPageContainer>
  );
};

export default LoginPage;
