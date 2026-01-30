'use client';

import { GifticonDetailResponseDto } from "@/types/gifticon/gifticon";
import styled from "styled-components";
import DdayView from "@/components/common/card/atomic/DdayView";
import { COLORS } from "@/constants/colors";
import { calculateDaysUntilExpiration } from "@/utils/DayUtils";
import Barcode from "react-barcode";
import { StyledText } from "@/utils/StyledText";

const CardContainer = styled.div<{ $isUsed: boolean }>`
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
  position: relative;
  opacity: ${props => props.$isUsed ? 0.7 : 1};
`;

const UsedOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  z-index: 15;
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
  z-index: 16;
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

const ActionButtonsWrapper = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 20;
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid ${COLORS.background.lightGray};
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;

  &:hover {
    background-color: ${COLORS.white};
    border-color: ${COLORS.primary};
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 16px;
    height: 16px;
    stroke: ${COLORS.text.primary};
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;

const EditIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

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
  coupon: GifticonDetailResponseDto;
  barcodeNumber?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

const InfoDetailCard = ({ coupon, barcodeNumber, onEdit, onDelete }: InfoDetailCardProps) => {
  const daysUntilExpiration = calculateDaysUntilExpiration(coupon.expiryDate);
  const formattedExpiration = formatExpirationDate(coupon.expiryDate);
  const defaultBarcode = barcodeNumber || String(coupon.gifticonId).padStart(16, '0');
  const formattedBarcode = formatBarcodeNumber(defaultBarcode);
  const isUsed = coupon.status === 'USED';

  const handleDelete = () => {
    if (confirm('정말 이 기프티콘을 삭제하시겠습니까?')) {
      onDelete?.();
    }
  };

  return (
    <CardContainer $isUsed={isUsed}>
      {isUsed && (
        <UsedOverlay>
          <UsedBadge>사용 완료</UsedBadge>
        </UsedOverlay>
      )}
      <ActionButtonsWrapper>
        {onEdit && (
          <ActionButton onClick={onEdit} aria-label="수정">
            <EditIcon />
          </ActionButton>
        )}
        {onDelete && (
          <ActionButton onClick={handleDelete} aria-label="삭제">
            <DeleteIcon />
          </ActionButton>
        )}
      </ActionButtonsWrapper>
      <ImageContainer>
        <DdayWrapper>
          <DdayView type="gift" dday={daysUntilExpiration} size="Medium" />
          </DdayWrapper>
          <ProductImage src={coupon.imageUrl} alt={coupon.productName} />

        </ImageContainer>
      <InfoContainer>
        <div style={{ marginBottom: '5px' }}>
            <StyledText fontSize={16} fontWeight={600} color={COLORS.text.secondary}>{coupon.brandName}</StyledText>
        </div>
        <StyledText fontSize={20} fontWeight={800} color={COLORS.text.primary}>{coupon.productName}</StyledText>
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
