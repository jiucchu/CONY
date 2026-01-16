import { Coupon } from "@/types/coupon/coupon";
import styled from "styled-components";
import DdayComponent from "./DdayView";
import { COLORS } from "@/constants/colors";

const VerticalGiftCardContainer = styled.div`
  justify-content: center;
  align-items: center;
  background-color: #FFFFFF;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  width: 180px;
  height: 270px;
  padding: 20px;

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
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: start;
  
`;

const CouponText = styled.p<{ fontSize: number; fontWeight: number; color: string }>`
  font-family: 'pretendard', sans-serif;
  font-size: ${props => props.fontSize}px;
  color: ${props => props.color};
  margin: 0;
  font-weight: ${props => props.fontWeight};
`;



const VerticalGiftCard = ({ coupon }: { coupon: Coupon }) => {
  const calculateDaysUntilExpiration = (expirationDate: string): number => {
    const today = new Date();
    const expiration = new Date(expirationDate);
    const diffTime = expiration.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiration = calculateDaysUntilExpiration(coupon.expiration_date);
  const formattedPrice = coupon.price.toLocaleString('ko-KR');

  return (
    <VerticalGiftCardContainer>
      <ImageContainer>
        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
            <DdayComponent dday={daysUntilExpiration} />
        </div>
        <ProductImage src={coupon.image_url} alt={coupon.title} />
      </ImageContainer>
      <InfoContainer>
        <CouponText fontSize={16} fontWeight={600} color={COLORS.text.secondary}>{coupon.brand}</CouponText>
        <CouponText fontSize={23} fontWeight={800} color={COLORS.text.primary}>{coupon.title}</CouponText>
        <CouponText fontSize={18} fontWeight={700} color={COLORS.text.primary}>{formattedPrice}</CouponText>
      </InfoContainer>
    </VerticalGiftCardContainer>
  );
};

export default VerticalGiftCard;