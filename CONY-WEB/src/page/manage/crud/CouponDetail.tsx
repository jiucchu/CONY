'use client';

import styled from "styled-components";
import InfoDetailCard from "@/components/InfoDetail/InfoDetailCard";
import { getCoupons } from "@/mockDB/mock";
import MemoInput from "@/components/InfoDetail/MemoInput";
import Memo from "@/components/InfoDetail/Memo";
import { COLORS } from "@/constants/colors";
import { useState } from "react";

import { StyledText } from "@/utils/StyledText";
import { goBack } from "@/utils/utils";
import { calculateDaysUntilExpiration } from "@/utils/DayUtils";

import ContentLayout from "@/components/layout/ContentLayout";
import AutoSellInfoCard from "@/components/InfoDetail/atomic/AutoSellInfoCard";


const CouponDetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 20px;
  gap: 24px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  width: 80%;
  max-width: 500px;
`;

const ActionButton = styled.button<{ variant: 'used' | 'sell' }>`
  flex: 1;
  padding: 14px 20px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
  font-family: 'Pretendard', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: ${COLORS.white};
  background-color: ${props => props.variant === 'used' ? COLORS.primary : COLORS.secondary};

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.9;
  }
`;

const MemoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 80%;
  max-width: 500px;
`;



const CouponDetail = ({ id }: { id: number }) => {
  const [memo, setMemo] = useState('');
  const [memos, setMemos] = useState<string[]>([]);

  const handleMemoSubmit = () => {
    if (memo.trim()) {
      setMemos([...memos, memo.trim()]);
      setMemo('');
    }
  };

  const handleUsedClick = () => {
    console.log('사용 완료 클릭');
  };

  const handleSellClick = () => {
    console.log('판매하기 클릭');
  };

  const coupons = getCoupons();
  console.log(coupons, id);
  const coupon = coupons.find(c => c.coupon_id === id);
  
  if (!coupon) {
    return (
      <CouponDetailContainer>
        <StyledText fontSize={18} fontWeight={600} color={COLORS.text.secondary}>
          쿠폰을 찾을 수 없습니다.
        </StyledText>
      </CouponDetailContainer>
    );
  }
  return (
    <ContentLayout headerType="back" headerTitle="쿠폰 상세" onBack={goBack}>
    <CouponDetailContainer>
      <AutoSellInfoCard daysLeft={calculateDaysUntilExpiration(coupon.auto_sell_date)} amount  ={coupon.auto_sell_amount} />
      <InfoDetailCard coupon={coupon} />
      
      <ButtonGroup>
        <ActionButton variant="used" onClick={handleUsedClick}>
          <StyledText fontSize={16} fontWeight={600} color={COLORS.white}>사용 완료</StyledText>
        </ActionButton>
        <ActionButton variant="sell" onClick={handleSellClick}>
          <StyledText fontSize={16} fontWeight={600} color={COLORS.white}>판매하기</StyledText>
        </ActionButton>
      </ButtonGroup>

      <MemoSection>
        <MemoInput
          value={memo}
          onChange={setMemo}
          placeholder="메모를 작성해주세요"
          onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              handleMemoSubmit();
            }
          }}
        />
        
        {memos.map((memoContent, index) => (
          <Memo
            key={index}
            type="mine"
            content={memoContent}
          />
        ))}
      </MemoSection>
    </CouponDetailContainer>
    </ContentLayout >
  );
};

export default CouponDetail;
