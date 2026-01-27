import { GifticonDetailResponseDto } from "@/types/gifticon/gifticon";
import styled from "styled-components";
import DdayView from "./DdayView";
import { COLORS } from "@/constants/colors";
import BarcodeButton from "./BarcodeButton";
import { calculateDaysUntilExpiration } from "@/utils/DayUtils";

const HorizontalGiftCardContainer = styled.div`
  width: 90%;
  background-color: #FFFFFF;
  border-radius: 10px;
  display: flex;
  flex-direction: row;
  padding: 16px;
  position: relative;
  max-width: 500px;
  gap: 16px;

  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);
`;

// 이미지 영역 확인을 위해 color 임시로 넣어두었습니다.
const ImageContainer = styled.div`
  width: 120px;
  height: 120px;
  min-width: 120px;
  background-color: gray;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: visible;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const InfoContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
`;


const CouponText = styled.p<{ fontSize: number; fontWeight: number; color: string }>`
  font-family: 'Pretendard', sans-serif;
  font-size: ${props => props.fontSize}px;
  color: ${props => props.color};
  margin: 0;
  font-weight: ${props => props.fontWeight};
`;


const HorizontalGiftCard = ({ coupon }: { coupon: GifticonDetailResponseDto }) => {
  const daysUntilExpiration = calculateDaysUntilExpiration(coupon.expiryDate);
  const formattedPrice = coupon.originalPrice.toLocaleString('ko-KR');

  return (
    <HorizontalGiftCardContainer>
      <div style={{ position: 'absolute', top: '15px', right: '15px' }}>
        <DdayView type="gift" dday={daysUntilExpiration} size="Small" />
      </div>
      <ImageContainer>
        <ProductImage src={coupon.imageUrl} alt={coupon.productName} />
      </ImageContainer>
      <InfoContainer>
        <CouponText fontSize={14} fontWeight={400} color={COLORS.text.secondary}>{coupon.brandName}</CouponText>
        <div style={{ display: 'flex', flexDirection: 'column'}}>
          <CouponText fontSize={23} fontWeight={900} color={COLORS.text.primary}>{coupon.productName}</CouponText>
          <CouponText fontSize={16} fontWeight={700} color={COLORS.text.primary}>{formattedPrice}원</CouponText>
        </div>
      </InfoContainer>
      <div style={{ position: 'absolute', bottom: '15px', right: '15px' }}>
        <BarcodeButton width={45} />
      </div>
    </HorizontalGiftCardContainer>
  );
};

export default HorizontalGiftCard;