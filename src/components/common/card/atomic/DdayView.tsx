import styled from "styled-components";
import { COLORS } from "@/constants/colors";
import { SizeType } from "@/types/common";

const DdayContainer = styled.div<{ size: number; $isExpired: boolean }>`
  background-color: ${props => props.$isExpired ? COLORS.text.secondary : COLORS.primary};
  border-radius: ${props => {
    const height = props.size * 0.45;
    return `0 0 0 ${height / 2}px`;
  }};
  padding: 11px 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  min-width: fit-content;
  height: ${props => props.size * 0.45}px;
`;

const DdayText = styled.p<{ size: number }>`
  font-family: 'pretendard', sans-serif;
  font-size: ${props => props.size}px;
  font-weight: 700;
  color: ${COLORS.text.white};
`;

const GiftDdayContainer = styled.div<{ size: number }>`
  background-color: #FFFFFF;
  border-radius: 100px;
  padding: 3px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: ${props => props.size}px;
  background-color: ${COLORS.primary};
`;

const DdayView = ({ type, dday, size }: { type: 'common' | 'gift', dday: number, size: SizeType }) => {
  const isExpired = dday <= 0;
  const displayText = isExpired ? '기간 만료' : `D-${dday}`;
  const fontSize = size === 'Small' ? 12 : size === 'Medium' ? 14 : 20;
  const containerSize = size === 'Small' ? 65 : size === 'Medium' ? 75 : 90;

  return (
    <> {type === 'common' ? (
      <DdayContainer size={containerSize} $isExpired={isExpired}>
        <DdayText size={fontSize}>{displayText}</DdayText>
      </DdayContainer>
    ) : (
      <GiftDdayContainer size={containerSize}>
        <DdayText size={fontSize}>{displayText}</DdayText>
      </GiftDdayContainer>
    )} </>
  );
};

export default DdayView;