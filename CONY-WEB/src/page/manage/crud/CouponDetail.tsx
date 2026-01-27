'use client';

import styled from "styled-components";
import InfoDetailCard from "@/components/InfoDetail/InfoDetailCard";
import { getCoupons } from "@/mockDB/mock";
import { GifticonDetailResponseDto } from "@/types/gifticon/gifticon";
import MemoInput from "@/components/InfoDetail/MemoInput";
import Memo from "@/components/InfoDetail/Memo";
import { COLORS } from "@/constants/colors";
import { useState, useEffect, useMemo } from "react";

import { StyledText } from "@/utils/StyledText";
import { goBack } from "@/utils/utils";
import { calculateDaysUntilExpiration } from "@/utils/DayUtils";

import ContentLayout from "@/components/layout/ContentLayout";
import AutoSellInfoCard from "@/components/InfoDetail/atomic/AutoSellInfoCard";
import RemainMoneyCard from "@/components/InfoDetail/RemainMoneyCard";

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
  const [coupons, setCoupons] = useState<GifticonDetailResponseDto[]>([]);

  // 클라이언트 사이드에서만 데이터 페칭
  useEffect(() => {
    setCoupons(getCoupons());
  }, []);

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

  const coupon = useMemo(() => {
    return coupons.find(c => c.gifticonId === id);
  }, [coupons, id]);
  
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
      <AutoSellInfoCard daysLeft={calculateDaysUntilExpiration(coupon.autoSellDate || coupon.expiryDate)} amount={coupon.autoSellAmount || 0} />
      <InfoDetailCard coupon={coupon} />
      
      <ButtonGroup>
        <ActionButton variant="used" onClick={handleUsedClick}>
          <StyledText fontSize={16} fontWeight={600} color={COLORS.white}>사용 완료</StyledText>
        </ActionButton>
        <ActionButton variant="sell" onClick={handleSellClick}>
          <StyledText fontSize={16} fontWeight={600} color={COLORS.white}>판매하기</StyledText>
        </ActionButton>
      </ButtonGroup>
      {coupon.gifticonType === 'PREPAID' && <RemainMoneyCard coupon={coupon} />}
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
