import React from 'react';
import styled from 'styled-components/native';
import { COLORS } from '../../../../constants/colors';
import { SizeType } from '../../../../types/common';

interface DdayViewProps {
  type: 'common' | 'gift';
  dday: number;
  size: SizeType;
}

const CommonContainer = styled.View<{ isExpired: boolean; height: number }>`
  background-color: ${(props: { isExpired: boolean; height: number }) => props.isExpired ? COLORS.text.secondary : COLORS.primary};
  border-bottom-left-radius: ${(props: { isExpired: boolean; height: number }) => props.height / 2}px;
  height: ${(props: { isExpired: boolean; height: number }) => props.height}px;
  padding-horizontal: 8px;
  padding-vertical: 6px;
  justify-content: center;
  align-items: center;
`;

const GiftContainer = styled.View<{ width: number; height: number }>`
  min-width: ${(props: { width: number; height: number }) => props.width + 20}px;
  height: ${(props: { width: number; height: number }) => props.height}px;
  border-radius: ${(props: { width: number; height: number }) => props.height / 2}px;
  background-color: ${COLORS.primary};
  padding-horizontal: 8px;
  padding-vertical: 4px;
  justify-content: center;
  align-items: center;
`;

const DdayText = styled.Text<{ fontSize: number }>`
  font-size: ${(props: { fontSize: number }) => props.fontSize}px;
  font-weight: 700;
  color: ${COLORS.text.white};
`;

const DdayView: React.FC<DdayViewProps> = ({ type, dday, size }) => {
  // NaN 또는 유효하지 않은 값 처리
  const validDday = isNaN(dday) || !isFinite(dday) ? 0 : dday;
  const isExpired = validDday <= 0;
  const displayText = isExpired ? '기간 만료' : `D-${validDday}`;
  const fontSize = size === 'Small' ? 8 : size === 'Medium' ? 10 : 12;
  const containerSize = size === 'Small' ? 40 : size === 'Medium' ? 50 : 60;
  const height = containerSize * 0.45;

  if (type === 'common') {
    return (
      <CommonContainer isExpired={isExpired} height={height}>
        <DdayText fontSize={fontSize}>{displayText}</DdayText>
      </CommonContainer>
    );
  }

  // 타원형을 위해 width와 height를 다르게 설정
  const giftWidth = containerSize;
  const giftHeight = containerSize * 0.7; // 타원형 비율
  
  return (
    <GiftContainer width={giftWidth} height={giftHeight}>
      <DdayText fontSize={fontSize} numberOfLines={1}>{displayText}</DdayText>
    </GiftContainer>
  );
};

export default DdayView;
