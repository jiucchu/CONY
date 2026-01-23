'use client';

import { Coupon } from "@/types/coupon/coupon";
import styled from "styled-components";
import DdayView from "@/components/common/card/atomic/DdayView";
import { COLORS } from "@/constants/colors";
import { calculateDaysUntilExpiration } from "@/utils/DayUtils";
import Barcode from "react-barcode";
import { StyledText } from "@/utils/StyledText";

const CardContainer = styled.div`
  background-color: #FFFFFF;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  width: 80%;
  padding: 12%;
  gap: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);
`;

const ImageContainer = styled.div`
  width: 60%;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  
`;


const ProductImage = styled.img`
  width: 90%;
  height: 90%;
  background-color: gray;

  object-fit: cover;
  border-radius: 10px;
`;

const DdayWrapper = styled.div`
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 10;
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BarcodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const BarcodeWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 0 20px;
`;





const formatExpirationDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `~${year}. ${month}. ${day} 까지`;
};

const formatBarcodeNumber = (barcode: string): string => {
  const cleaned = barcode.replace(/\s/g, '');
  const parts = [];
  for (let i = 0; i < cleaned.length; i += 4) {
    parts.push(cleaned.slice(i, i + 4));
  }
  return parts.join(' ');
};

interface InfoDetailCardProps {
  coupon: Coupon;
  barcodeNumber?: string;
}

const InfoDetailCard = ({ coupon, barcodeNumber }: InfoDetailCardProps) => {
  const daysUntilExpiration = calculateDaysUntilExpiration(coupon.expiration_date);
  const formattedExpiration = formatExpirationDate(coupon.expiration_date);
  const defaultBarcode = barcodeNumber || String(coupon.coupon_id).padStart(16, '0');
  const formattedBarcode = formatBarcodeNumber(defaultBarcode);

  return (
    <CardContainer>
      <ImageContainer>
        <DdayWrapper>
          <DdayView type="gift" dday={daysUntilExpiration} size="Medium" />
          </DdayWrapper>
          <ProductImage src={coupon.image_url} alt={coupon.title} />

        </ImageContainer>
      <InfoContainer>
        <div style={{ marginBottom: '5px' }}>
            <StyledText fontSize={16} fontWeight={600} color={COLORS.text.secondary}>{coupon.brand}</StyledText>
        </div>
        <StyledText fontSize={20} fontWeight={800} color={COLORS.text.primary}>{coupon.title}</StyledText>
        <StyledText fontSize={16} fontWeight={400} color={COLORS.text.primary}>{formattedExpiration}</StyledText>
      </InfoContainer>
      <BarcodeContainer>
        <BarcodeWrapper>
          <Barcode
            value={defaultBarcode}
            format="CODE128"
            width={2}
            height={80}
            displayValue={false}
          />
        </BarcodeWrapper>
        <StyledText fontSize={15} fontWeight={400} color={COLORS.text.primary}>{formattedBarcode}</StyledText>
      </BarcodeContainer>
    </CardContainer>
  );
};

export default InfoDetailCard;
