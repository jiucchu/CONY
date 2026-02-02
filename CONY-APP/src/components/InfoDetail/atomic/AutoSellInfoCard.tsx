import React from 'react';
import styled from 'styled-components/native';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';

const Container = styled.View`
  width: 80%;
  align-items: center;
  padding: 10px 0;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
  margin-bottom: 20px;
`;

const PaddingSection = styled.View`
  width: 100%;
  align-items: center;
`;

const NoticeContainer = styled.View`
  align-items: center;
  margin-bottom: 12px;
`;

const DaysLeftContainer = styled.View`
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  flex-direction: row;
  flex-wrap: wrap;
`;

const AmountContainer = styled.View`
  align-items: baseline;
  justify-content: center;
  width: 100%;
  gap: 8px;
  flex-direction: row;
  flex-wrap: wrap;
  border-top-width: 1px;
  border-top-color: ${COLORS.background.lightGray};
  padding-top: 16px;
  margin-top: 16px;
`;

interface AutoSellInfoCardProps {
  daysLeft: number;
  amount: number;
}

const AutoSellInfoCard = ({ daysLeft, amount }: AutoSellInfoCardProps) => {
  const formattedAmount = amount.toLocaleString('ko-KR');

  return (
    <Container>
      <PaddingSection>
        <NoticeContainer>
          <StyledText fontSize={10} fontWeight={400} color={COLORS.text.secondary}>
            사용 혹은 양도하신 기프티콘이시라면 사용 완료를 눌러주세요.
          </StyledText>
        </NoticeContainer>
        <DaysLeftContainer>
          <StyledText fontSize={16} fontWeight={700}>
            자동 판매 예정일까지
          </StyledText>
          <StyledText fontSize={20} fontWeight={700} color={COLORS.primary}>
            {daysLeft}
          </StyledText>
          <StyledText fontSize={16} fontWeight={700}>
            일 남았습니다.
          </StyledText>
        </DaysLeftContainer>
      </PaddingSection>
      <AmountContainer>
        <StyledText fontSize={12} fontWeight={400} color={COLORS.text.primary}>
          판매 예정 금액
        </StyledText>
        <StyledText fontSize={12} fontWeight={900} color={COLORS.text.primary}>
          {formattedAmount}원
        </StyledText>
      </AmountContainer>
    </Container>
  );
};

export default AutoSellInfoCard;
