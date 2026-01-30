import { GifticonDetailResponseDto, GifticonListResponseDto } from "@/types/gifticon/gifticon";
import styled from "styled-components";
import { COLORS } from "@/constants/colors";
import { calculateDaysUntilExpiration } from "@/utils/DayUtils";
import DdayView from "./DdayView";
import BarcodeButton from "./BarcodeButton";
import { useRouter } from "next/navigation";

const MainGiftCardContainer = styled.div<{ $isUsed: boolean }>`
  justify-content: center;
  position: relative;
  background-color: #FFFFFF;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  width: 300px;
  aspect-ratio: 1.5;
  padding: 8%;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);
  opacity: ${props => props.$isUsed ? 0.6 : 1};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.2);
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
  pointer-events: none;
`;

const UsedBadge = styled.div`
  background-color: ${COLORS.text.secondary};
  color: ${COLORS.white};
  padding: 8px 16px;
  border-radius: 20px;
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 700;
  z-index: 6;
`;

// 이미지 영역 확인을 위해해 color 임시로 넣어두었습니다.
const ImageContainer = styled.div`
  width: 100%;
  aspect-ratio: 1;
  background-color: gray;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
  position: relative;
`;


const ProductImage = styled.img`
  width: 100%;
  height: auto;
  object-fit: contain;
  max-height: 200px;
`;

const InfoContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: start;
  
`;

const CouponText = styled.p<{ fontSize: number; fontWeight: number; color: string }>`
  font-family: 'pretendard', sans-serif;
  font-size: ${props => props.fontSize}px;
  color: ${props => props.color};
  font-weight: ${props => props.fontWeight};
`;

const MainGiftCard = ({ coupon }: { coupon: GifticonDetailResponseDto | GifticonListResponseDto }) => {
  const router = useRouter();
  const daysUntilExpiration = calculateDaysUntilExpiration(coupon.expiryDate);
  const isUsed = coupon.status === 'USED';

  const handleCardClick = () => {
    router.push(`/coupon/detail?id=${coupon.gifticonId}`);
  };

  return (
    <MainGiftCardContainer $isUsed={isUsed} onClick={handleCardClick}>
      {isUsed && (
        <UsedOverlay>
          <UsedBadge>사용 완료</UsedBadge>
        </UsedOverlay>
      )}
      <div style={{ marginBottom: '16px' }}>
        <CouponText fontSize={16} fontWeight={600} color={COLORS.text.secondary}>
          최근 12번 방문한 브랜드예요
        </CouponText>
      </div>
      <ImageContainer>
        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
            <DdayView type="gift" dday={daysUntilExpiration} size="Large" />
        </div>
        <ProductImage src={coupon.imageUrl} alt={coupon.productName} />
      </ImageContainer>
      <InfoContainer> 
        <CouponText fontSize={16} fontWeight={600} color={COLORS.text.secondary}>{coupon.brandName}</CouponText>
        <CouponText fontSize={25} fontWeight={800} color={COLORS.text.primary}>{coupon.productName}</CouponText>
      </InfoContainer>
       {/* 바코드 추후 추가 */}
      </MainGiftCardContainer>
    );
  };

  export default MainGiftCard;