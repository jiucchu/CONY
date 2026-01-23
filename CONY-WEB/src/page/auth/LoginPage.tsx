import styled from "styled-components";
import LoginButton from "@/components/common/atomic/LoginButton";
import { COLORS } from "@/constants/colors";
import appleIcon from "@/assets/icons/apple_icon.svg";
import kakaoIcon from "@/assets/icons/kakao_icon.svg";
import googleIcon from "@/assets/icons/google_icon.png";

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


const LoginPage = () => {
  const handleGoogleLogin = (accountId?: string) => {
    // 로그인 로직 추후 구현 예정정
  };

  return (
    <LoginPageContainer>
      <BrandSection>
        <FontText fontSize={20} fontWeight={600} color={COLORS.text.white}>🧚</FontText>
        <FontText fontSize={16} fontWeight={600} color={COLORS.text.white}>나만의 작은 쿠폰 요정</FontText>
        <FontText fontSize={60} fontWeight={800} color={COLORS.text.white}>CONY</FontText>
      </BrandSection>

      <LoginButtonsContainer>
        <LoginButton iconSrc={googleIcon.src} iconAlt="Google" children="Google 계정으로 로그인" />
        <LoginButton iconSrc={appleIcon.src} iconAlt="Apple" children="Apple 계정으로 로그인" />
        <LoginButton iconSrc={kakaoIcon.src} iconAlt="Kakao" children="Kakao 계정으로 로그인" color="#F7E111"/>
      </LoginButtonsContainer>
    </LoginPageContainer>
  );
};

export default LoginPage;
