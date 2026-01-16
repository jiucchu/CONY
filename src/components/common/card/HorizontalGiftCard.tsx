import { Coupon } from "@/types/coupon/coupon";
import styled from "styled-components";
import DdayComponent from "./DdayView";
import { COLORS } from "@/constants/colors";
import barcodeImage from "@/assets/barcode.png";

const HorizontalGiftCardContainer = styled.div`
  background-color: #FFFFFF;
  border-radius: 10px;
  display: flex;
  flex-direction: row;
  padding: 16px;
  position: relative;
  width: 100%;
  max-width: 500px;
  gap: 16px;
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


const BarcodeButton = styled.button<{ width: number }>`
  width: ${props => props.width}px;
  height: ${props => props.width}px;
  min-width: ${props => props.width}px;
  background-color: #FFFFFF;
  border: 2px solid #E5E5E5;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  align-self: center;

  &:hover {
    background-color: #F9F9F9;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: grayscale(100%);
    opacity: 0.7;
  }
`;

const HorizontalGiftCard = ({ coupon }: { coupon: Coupon }) => {
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
    <HorizontalGiftCardContainer>
      <div style={{ position: 'absolute', top: '15px', right: '15px' }}>
              <DdayComponent dday={daysUntilExpiration} />
      </div>
      <ImageContainer>


        <ProductImage src={coupon.image_url} alt={coupon.title} />
      </ImageContainer>
      <InfoContainer>
        <CouponText fontSize={14} fontWeight={400} color={COLORS.text.secondary}>{coupon.brand}</CouponText>
        <div style={{ display: 'flex', flexDirection: 'column'}}>
          <CouponText fontSize={25} fontWeight={900} color={COLORS.text.primary}>{coupon.title}</CouponText>
          <CouponText fontSize={19} fontWeight={700} color={COLORS.text.primary}>{formattedPrice}원</CouponText>
        </div>
      </InfoContainer>
      <div style={{ position: 'absolute', bottom: '15px', right: '15px' }}>
      <BarcodeButton width={45}>
        <img src={typeof barcodeImage === 'string' ? barcodeImage : barcodeImage.src} alt="barcode" />
      </BarcodeButton>
      </div>
    </HorizontalGiftCardContainer>
  );
};

export default HorizontalGiftCard;