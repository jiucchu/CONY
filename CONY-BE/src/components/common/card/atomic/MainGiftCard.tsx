import { Coupon } from "@/types/coupon/coupon";
import styled from "styled-components";
import { COLORS } from "@/constants/colors";
import { calculateDaysUntilExpiration } from "@/utils/DayUtils";
import DdayView from "../DdayView";
import BarcodeButton from "./BarcodeButton";

const MainGiftCardContainer = styled.div`
  justify-content: center;
  align-items: center;
  position: relative;
  background-color: #FFFFFF;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  width: 300px;
  aspect-ratio: 1.5;
  padding: 8%;

  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);
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
  font-weight: ${props => props.fontWeight};
`;

const MainGiftCard = ({ coupon }: { coupon: Coupon }) => {

  const daysUntilExpiration = calculateDaysUntilExpiration(coupon.expiration_date);
  const formattedPrice = coupon.price.toLocaleString('ko-KR');
  return (
    <MainGiftCardContainer>
      <div style={{ marginBottom: '16px' }}>
        <CouponText fontSize={16} fontWeight={600} color={COLORS.text.secondary}>
          최근 12번 방문한 브랜드예요
        </CouponText>
      </div>
      <ImageContainer>
        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
                <DdayView dday={daysUntilExpiration} size="Large" />
        </div>
        <ProductImage src={coupon.image_url} alt={coupon.title} />
        </ImageContainer>

        <InfoContainer> 
          <CouponText fontSize={16} fontWeight={600} color={COLORS.text.secondary}>{coupon.brand}</CouponText>
          <CouponText fontSize={25} fontWeight={800} color={COLORS.text.primary}>{coupon.title}</CouponText>
          <CouponText fontSize={20} fontWeight={700} color={COLORS.text.primary}>{formattedPrice}원</CouponText>
        </InfoContainer>
        <div style={{ position: 'absolute', bottom: '7%', right: '10%'}}>
          <BarcodeButton width={50} />
        </div>
    </MainGiftCardContainer>
  );
}

export default MainGiftCard;