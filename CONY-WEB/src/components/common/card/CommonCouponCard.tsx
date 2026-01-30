import { GifticonDetailResponseDto, GifticonListResponseDto } from "@/types/gifticon/gifticon";
import styled from "styled-components";
import DdayView from "./atomic/DdayView";
import { COLORS } from "@/constants/colors";
import { calculateDaysUntilExpiration } from "@/utils/DayUtils";
import { StyledText } from "@/utils/StyledText";
import { useRouter } from "next/navigation";

const CardContainer = styled.div<{ $isUsed: boolean }>`
  background-color: #FFFFFF;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  width: 45%;
  min-width: 180px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  opacity: ${props => props.$isUsed ? 0.6 : 1};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

const UsedOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UsedBadge = styled.div`
  background-color: ${COLORS.text.secondary};
  color: ${COLORS.white};
  padding: 6px 12px;
  border-radius: 20px;
  font-family: 'Pretendard', sans-serif;
  font-size: 12px;
  font-weight: 700;
  z-index: 6;
`;

const ImageContainer = styled.div`
  width: 100%;
  aspect-ratio: 1.4;
  flex: 2;
  background-color: #E5E5E5;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  min-height: 0;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const InfoContainer = styled.div`
  flex: 1;
  background-color: #FFFFFF;
  padding: 16px;
  display: flex;
  flex-direction: column;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-wrap: wrap;
`;

const DiscountBadge = styled.span`
  font-family: 'Pretendard', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: ${COLORS.primary};
`;

const DiscountPrice = styled.span`
  font-family: 'Pretendard', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: ${COLORS.text.primary};
  
  &::after {
    content: '원';
    font-size: 14px;
    font-weight: 700;
  }
`;

const OriginalPrice = styled.span`
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: ${COLORS.text.secondary};
  text-decoration: line-through;
  
  &::after {
    content: '원';
    font-size: 14px;
    font-weight: 400;
  }
`;

const DdayWrapper = styled.div`
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 10;
`;

interface CommonCouponCardProps {
  coupon: GifticonDetailResponseDto | GifticonListResponseDto;
  discountRate?: number;
  originalPrice?: number;
  handleCardClickProps?: () => void;
}

const CommonCouponCard = ({ 
  coupon, 
  discountRate, 
  originalPrice,
  handleCardClickProps,
}: CommonCouponCardProps) => {
  const router = useRouter();
  const daysUntilExpiration = calculateDaysUntilExpiration(coupon.expiryDate);
  const couponOriginalPrice = 'originalPrice' in coupon ? coupon.originalPrice : 0;
  const formattedPrice = couponOriginalPrice.toLocaleString('ko-KR');
  const formattedOriginalPrice = originalPrice ? originalPrice.toLocaleString('ko-KR') : '';
  
  const displayDiscountRate = discountRate || 0;
  const displayOriginalPrice = originalPrice || couponOriginalPrice;
  const isUsed = coupon.status === 'USED';

  // productName이 8글자 이상이면 말줄임 처리
  const displayProductName = coupon.productName.length > 8 
    ? `${coupon.productName.substring(0, 8)}...` 
    : coupon.productName;

  // 클릭 이벤트 함수
  const handleCardClick = () => {
    if (handleCardClickProps) { 
    handleCardClickProps?.();
    } else {
        router.push(`/coupon/detail?id=${coupon.gifticonId}`);
    }
  };

  return (
    <CardContainer $isUsed={isUsed} onClick={handleCardClick}>
      {isUsed && (
        <UsedOverlay>
          <UsedBadge>사용 완료</UsedBadge>
        </UsedOverlay>
      )}
      <ImageContainer>
          <DdayWrapper>
            <DdayView type="common" dday={daysUntilExpiration} size="Medium" />
          </DdayWrapper>

        <ProductImage src={coupon.imageUrl} alt={coupon.productName} />
      </ImageContainer>
      <InfoContainer>
        <StyledText fontSize={16} fontWeight={600} color={COLORS.text.secondary}>{coupon.brandName}</StyledText>
        <StyledText fontSize={20} fontWeight={800} color={COLORS.text.primary}>{displayProductName}</StyledText>
        <PriceContainer>
          {displayDiscountRate > 0 && (
            <>
              <DiscountBadge>{displayDiscountRate}%</DiscountBadge>
              <DiscountPrice>{formattedPrice}</DiscountPrice>
            </>
          )}
          {displayOriginalPrice > 0 && (
            <OriginalPrice>{formattedOriginalPrice}</OriginalPrice>
          )}
        </PriceContainer>
      </InfoContainer>
    </CardContainer>
  );
};

export default CommonCouponCard;
