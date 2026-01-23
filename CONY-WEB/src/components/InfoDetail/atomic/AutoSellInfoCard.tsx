import styled from "styled-components";
import { COLORS } from "@/constants/colors";
import { StyledText } from "@/utils/StyledText";

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  width: 100%;
  justify-content: center;
  align-items: center;
`;

const NoticeContainer = styled.div`
  text-align: center;
`;

const DaysLeftContainer = styled.div`
  text-align: center;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
`;

const AmountContainer = styled.div`
  text-align: center;
  width:50%;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  border-top: 1px solid ${COLORS.background.lightGray};
  padding: 10px;
`;

interface AutoSellInfoCardProps {
  daysLeft: number;
  amount: number;
}

const AutoSellInfoCard = ({ daysLeft, amount }: AutoSellInfoCardProps) => {
  const formattedAmount = amount.toLocaleString('ko-KR');

  return (
    <CardContainer>
      <div style={{ padding: '10px 0' }}>
      <NoticeContainer>
        <StyledText fontSize={12} fontWeight={400} color={COLORS.text.secondary}>
          사용 혹은 양도하신 기프티콘이시라면 사용 완료를 눌러주세요.
        </StyledText>
      </NoticeContainer>
      
      <DaysLeftContainer>
        <StyledText fontSize={18} fontWeight={700}>자동 판매 예정일까지</StyledText>
        <StyledText fontSize={24} fontWeight={700} color={COLORS.primary}>{daysLeft}</StyledText>
        <StyledText fontSize={18} fontWeight={700}>일 남았습니다.</StyledText>
      </DaysLeftContainer>
      </div>
      <AmountContainer>
        <StyledText fontSize={14} fontWeight={400} color={COLORS.text.primary}>판매 예정 금액</StyledText>
        <StyledText fontSize={14} fontWeight={900} color={COLORS.text.primary}>{formattedAmount}원</StyledText>
      </AmountContainer>
    </CardContainer>
  );
};

export default AutoSellInfoCard;
