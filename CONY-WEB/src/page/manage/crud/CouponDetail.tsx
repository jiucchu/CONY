'use client';

import styled from "styled-components";
import InfoDetailCard from "@/components/InfoDetail/InfoDetailCard";
import { GifticonDetailResponseDto } from "@/types/gifticon/gifticon";
import MemoInput from "@/components/InfoDetail/MemoInput";
import Memo from "@/components/InfoDetail/Memo";
import { COLORS } from "@/constants/colors";
import { useState, useEffect } from "react";
import { getGifticonDetail, useGifticon, cancelUseGifticon, updateGifticonInfo } from "@/api/gifticon/gifticonApi";

import { StyledText } from "@/utils/StyledText";
import { goBack } from "@/utils/utils";
import { calculateDaysUntilExpiration } from "@/utils/DayUtils";
import { useRouter } from "next/navigation";

import ContentLayout from "@/components/layout/ContentLayout";
import AutoSellInfoCard from "@/components/InfoDetail/atomic/AutoSellInfoCard";
import RemainMoneyCard from "@/components/InfoDetail/RemainMoneyCard";
import CouponList from "@/components/common/card/CouponList";
import { getMyGifticons } from "@/api/gifticon/gifticonApi";
import { GifticonListResponseDto } from "@/types/gifticon/gifticon";

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
  const router = useRouter();
  const [memo, setMemo] = useState('');
  const [memos, setMemos] = useState<string[]>([]);
  const [coupon, setCoupon] = useState<GifticonDetailResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendedCoupons, setRecommendedCoupons] = useState<GifticonListResponseDto[]>([]);

  // API로 데이터 페칭
  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        setLoading(true);
        const data = await getGifticonDetail(id);
        setCoupon(data);
        setError(null);
      } catch (err) {
        console.error('기프티콘 조회 실패:', err);
        setError('기프티콘을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCoupon();
    }
  }, [id]);

  // 추천 쿠폰 목록 가져오기
  useEffect(() => {
    const fetchRecommendedCoupons = async () => {
      try {
        const response = await getMyGifticons({ page: 0, size: 10 });
        // 현재 쿠폰 제외
        const filtered = response.content.filter(c => c.gifticonId !== id);
        setRecommendedCoupons(filtered.slice(0, 10));
      } catch (err) {
        console.error('추천 쿠폰 조회 실패:', err);
      }
    };

    if (id) {
      fetchRecommendedCoupons();
    }
  }, [id]);

  const handleMemoSubmit = () => {
    if (memo.trim()) {
      setMemos([...memos, memo.trim()]);
      setMemo('');
    }
  };

  const handleUsedClick = async () => {
    if (!coupon) return;

    // 사용된 쿠폰인 경우 취소 처리
    if (coupon.status === 'USED') {
      // 상품권(PREPAID)이고 사용 내역이 없는 경우
      // 상품권은 사용 내역이 없을 수 있으므로, 원래 금액으로 복구
      if (coupon.gifticonType === 'PREPAID' && (!coupon.histories || coupon.histories.length === 0)) {
        if (!window.confirm(`정말 사용을 취소하시겠습니까?\n잔액이 ${coupon.originalPrice.toLocaleString('ko-KR')}원으로 복구됩니다.`)) {
          return;
        }

        try {
          // 사용 내역이 없는 상품권의 경우, 프론트엔드에서 상태를 복구
          // 실제 서버 상태는 변경되지 않지만, 사용자 경험을 위해 UI에서만 복구
          setCoupon({
            ...coupon,
            status: 'NOT_USED',
            currentBalance: coupon.originalPrice,
          });
          alert('사용 취소되었습니다.\n\n참고: 사용 내역이 없는 상품권은 서버에서 직접 복구할 수 없습니다. 실제 복구를 위해서는 관리자에게 문의해주세요.');
        } catch (error) {
          console.error('상태 복구 실패:', error);
          alert('상태 복구에 실패했습니다.');
        }
        return;
      }

      // 사용 내역이 있는 경우 (일반적인 경우)
      if (!coupon.histories || coupon.histories.length === 0) {
        alert('사용 내역이 없습니다. 이미 취소되었거나 사용 내역이 존재하지 않습니다.');
        return;
      }

      // 최근 사용 내역 찾기 (날짜순 정렬)
      const sortedHistories = [...coupon.histories].sort((a, b) => {
        const dateA = new Date(a.usedAt).getTime();
        const dateB = new Date(b.usedAt).getTime();
        return dateB - dateA;
      });
      
      const latestLog = sortedHistories[0];

      if (!latestLog || !latestLog.logId) {
        alert('사용 내역을 찾을 수 없습니다. 사용 내역 데이터가 올바르지 않습니다.');
        return;
      }

      if (!window.confirm('정말 사용을 취소하시겠습니까?')) {
        return;
      }

      try {
        await cancelUseGifticon(latestLog.logId);
        alert('사용 취소되었습니다.');
        
        // 쿠폰 정보 다시 불러오기
        const updatedCoupon = await getGifticonDetail(id);
        setCoupon(updatedCoupon);
      } catch (error) {
        console.error('사용 취소 실패:', error);
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
        alert(`사용 취소에 실패했습니다.\n\n${errorMessage}`);
      }
      return;
    }

    // 사용 완료 처리 (항상 전체 금액 사용)
    const confirmMessage = '정말 사용 완료 처리하시겠습니까?';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      // 항상 전체 금액 사용
      const useAmount = coupon.originalPrice;

      // API 호출
      await useGifticon(id, { amount: useAmount });
      
      // 성공 메시지
      alert('사용 완료 처리되었습니다.');
      
      // 쿠폰 정보 다시 불러오기
      const updatedCoupon = await getGifticonDetail(id);
      setCoupon(updatedCoupon);
    } catch (error) {
      console.error('사용 완료 처리 실패:', error);
      alert(`사용 완료 처리에 실패했습니다. ${error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'}`);
    }
  };

  const handleSellClick = () => {
    console.log('판매하기 클릭');
  };

  const handleEdit = () => {
    router.push(`/coupon/modify?id=${id}`);
  };

  const handleDelete = () => {
    // TODO: 실제 삭제 API 호출
    console.log('기프티콘 삭제:', id);
    // 삭제 후 목록 페이지로 이동하거나 뒤로가기
    goBack();
  };

  if (loading) {
    return (
      <ContentLayout headerType="back" headerTitle="쿠폰 상세" onBack={goBack}>
        <CouponDetailContainer>
          <StyledText fontSize={18} fontWeight={600} color={COLORS.text.secondary}>
            로딩 중...
          </StyledText>
        </CouponDetailContainer>
      </ContentLayout>
    );
  }

  if (error || !coupon) {
    return (
      <ContentLayout headerType="back" headerTitle="쿠폰 상세" onBack={goBack}>
        <CouponDetailContainer>
          <StyledText fontSize={18} fontWeight={600} color={COLORS.text.secondary}>
            {error || '쿠폰을 찾을 수 없습니다.'}
          </StyledText>
        </CouponDetailContainer>
      </ContentLayout>
    );
  }
  return (
    <ContentLayout headerType="back" headerTitle="쿠폰 상세" onBack={goBack}>
    <CouponDetailContainer>
      <AutoSellInfoCard daysLeft={calculateDaysUntilExpiration(coupon.autoSellDate || coupon.expiryDate)} amount={coupon.autoSellAmount || 0} />
      <InfoDetailCard coupon={coupon} onEdit={handleEdit} onDelete={handleDelete} />
      
      <ButtonGroup>
        <ActionButton variant="used" onClick={handleUsedClick}>
          <StyledText fontSize={16} fontWeight={600} color={COLORS.white}>
            {coupon.status === 'USED' ? '사용 취소' : '사용 완료'}
          </StyledText>
        </ActionButton>
        {coupon.status !== 'USED' && (
          <ActionButton variant="sell" onClick={handleSellClick}>
            <StyledText fontSize={16} fontWeight={600} color={COLORS.white}>판매하기</StyledText>
          </ActionButton>
        )}
      </ButtonGroup>
      {coupon.gifticonType === 'PREPAID' && (
        <RemainMoneyCard 
          coupon={coupon} 
          gifticonId={id}
          onUpdate={() => {
            const fetchCoupon = async () => {
              try {
                const updatedCoupon = await getGifticonDetail(id);
                setCoupon(updatedCoupon);
              } catch (err) {
                console.error('기프티콘 조회 실패:', err);
              }
            };
            fetchCoupon();
          }} 
        />
      )}
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
      {recommendedCoupons.length > 0 && (
        <CouponList 
          coupons={recommendedCoupons} 
          title="추천 쿠폰"
        />
      )}
    </CouponDetailContainer>
    </ContentLayout >
  );
};

export default CouponDetail;
