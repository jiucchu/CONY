'use client';

import styled from "styled-components";
import { COLORS } from "@/constants/colors";
import { StyledText } from "@/utils/StyledText";
import SwitchToggle from "@/components/common/atomic/SwitchToggle";
import { useState, useEffect } from "react";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

const FieldRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const FieldLabel = styled.div`
  display: flex;
  align-items: center;
`;

const FormField = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 1px solid ${COLORS.background.lightGray};
  border-radius: 8px;
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: ${COLORS.text.primary};
  background-color: ${COLORS.white};
  outline: none;
  transition: border-color 0.2s;
  width: 100%;

  &:focus {
    border-color: ${COLORS.primary};
  }

  &::placeholder {
    color: ${COLORS.text.secondary};
  }
`;

interface AutoSellInfoProps {
  isAutoSellEnabled?: boolean;
  saleDate?: string;
  saleAmount?: number;
  onAutoSellToggle?: (enabled: boolean) => void;
  onSaleDateChange?: (date: string) => void;
  onSaleAmountChange?: (amount: number) => void;
}

const AutoSellInfo = ({
  isAutoSellEnabled: propIsAutoSellEnabled = false,
  saleDate = '',
  saleAmount = 0,
  onAutoSellToggle,
  onSaleDateChange,
  onSaleAmountChange,
}: AutoSellInfoProps) => {
  const [isAutoSellEnabled, setIsAutoSellEnabled] = useState(propIsAutoSellEnabled);
  const [localSaleDate, setLocalSaleDate] = useState(saleDate);
  const [localSaleAmount, setLocalSaleAmount] = useState(saleAmount.toString());

  // prop이 변경되면 내부 상태 동기화
  useEffect(() => {
    setIsAutoSellEnabled(propIsAutoSellEnabled);
  }, [propIsAutoSellEnabled]);

  useEffect(() => {
    setLocalSaleDate(saleDate);
  }, [saleDate]);

  useEffect(() => {
    setLocalSaleAmount(saleAmount.toString());
  }, [saleAmount]);

  const handleToggle = () => {
    const newValue = !isAutoSellEnabled;
    setIsAutoSellEnabled(newValue);
    onAutoSellToggle?.(newValue);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9/]/g, '');
    
    // YYYY/MM/DD 형식으로 자동 포맷팅
    if (value.length > 4 && value[4] !== '/') {
      value = value.slice(0, 4) + '/' + value.slice(4);
    }
    if (value.length > 7 && value[7] !== '/') {
      value = value.slice(0, 7) + '/' + value.slice(7);
    }
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
    
    setLocalSaleDate(value);
    onSaleDateChange?.(value);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const numValue = parseInt(value) || 0;
    setLocalSaleAmount(value);
    onSaleAmountChange?.(numValue);
  };

  const formatAmount = (value: string) => {
    const numValue = value.replace(/[^0-9]/g, '');
    return numValue ? parseInt(numValue).toLocaleString('ko-KR') : '';
  };

  return (
    <Container>
      <FieldRow>
        <FieldLabel>
          <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
            자동 판매 등록
          </StyledText>
        </FieldLabel>
        <SwitchToggle
          isOn={isAutoSellEnabled}
          onClick={handleToggle}
          ariaLabel="자동 판매 등록"
        />
      </FieldRow>

      {isAutoSellEnabled && (
        <>
          <FormField>
            <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
              판매일자
            </StyledText>
            <Input
              type="text"
              value={localSaleDate}
              onChange={handleDateChange}
              placeholder="YYYY/MM/DD"
              maxLength={10}
            />
          </FormField>

          <FormField>
            <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
              판매금액
            </StyledText>
            <Input
              type="text"
              value={formatAmount(localSaleAmount)}
              onChange={handleAmountChange}
              placeholder="판매금액을 입력하세요"
            />
          </FormField>
        </>
      )}
    </Container>
  );
};

export default AutoSellInfo;
