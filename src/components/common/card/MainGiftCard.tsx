import { Coupon } from "@/types/coupon/coupon";
import styled from "styled-components";
import DdayComponent from "./DdayView";
import { COLORS } from "@/constants/colors";
import { calculateDaysUntilExpiration } from "@/utils/DayUtils";

const MainGiftCardContainer = styled.div`
  justify-content: center;
  align-items: center;
  position: relative;
  background-color: #FFFFFF;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  width: 160px;
  height: 240px;
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



const MainGiftCard = ({ coupon }: { coupon: Coupon }) => {

  const daysUntilExpiration = calculateDaysUntilExpiration(coupon.expiration_date);
  const formattedPrice = coupon.price.toLocaleString('ko-KR');

  return (
    <MainGiftCardContainer>
      <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
              <DdayComponent dday={daysUntilExpiration} />
      </div>
      <ImageContainer>
        <ProductImage src={coupon.image_url} alt={coupon.title} />
      </ImageContainer>
      <InfoContainer>
        <CouponText fontSize={13} fontWeight={600} color={COLORS.text.secondary}>{coupon.brand}</CouponText>
        <CouponText fontSize={20} fontWeight={800} color={COLORS.text.primary}>{coupon.title}</CouponText>
        <CouponText fontSize={16} fontWeight={700} color={COLORS.text.primary}>{formattedPrice}</CouponText>
      </InfoContainer>
    </MainGiftCardContainer>
  );
};

export default MainGiftCard;