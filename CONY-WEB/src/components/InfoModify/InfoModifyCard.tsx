'use client';

import styled from "styled-components";
import { COLORS } from "@/constants/colors";
import { useState } from "react";
import Image from "next/image";
import editIcon from "@/assets/icons/edit.svg";
import { StyledText } from "@/utils/StyledText";

const CardContainer = styled.div`
  margin: 20px auto;
  width: 80%;
  max-width: 500px;
  background-color: ${COLORS.white};
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);
`;

const ImageSection = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ImageCard = styled.div`
  width: 180px;
  height: 180px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
  background-color: ${COLORS.background.lightGray};

`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const EditButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;

  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${COLORS.background.lightGray};
  }
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormField = styled.div`
  width:100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 1px solid ${COLORS.background.lightGray};
  border-radius: 8px;
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: ${COLORS.text.primary};
  background-color: ${COLORS.white};
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${COLORS.primary};
  }

  &::placeholder {
    color: ${COLORS.text.secondary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const TypeButton = styled.button<{ isSelected: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid ${props => props.isSelected ? COLORS.primary : COLORS.background.lightGray};
  border-radius: 8px;
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.isSelected ? COLORS.white : COLORS.text.primary};
  background-color: ${props => props.isSelected ? COLORS.primary : COLORS.white};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${COLORS.primary};
    ${props => !props.isSelected && `
      color: ${COLORS.primary};
    `}
  }
`;

interface InfoModifyCardProps {
  imageUrl?: string;
  giftCardName?: string;
  barcode?: string;
  store?: string;
  type?: 'product' | 'amount';
  price?: number;
  expirationDate?: string;
  onImageEdit?: () => void;
  onGiftCardNameChange?: (value: string) => void;
  onBarcodeChange?: (value: string) => void;
  onStoreChange?: (value: string) => void;
  onTypeChange?: (type: 'product' | 'amount') => void;
  onPriceChange?: (value: number) => void;
  onExpirationDateChange?: (value: string) => void;
}

const InfoModifyCard = ({
  imageUrl = '',
  giftCardName = '',
  barcode = '',
  store = '',
  type = 'product',
  price = 0,
  expirationDate = '',
  onImageEdit,
  onGiftCardNameChange,
  onBarcodeChange,
  onStoreChange,
  onTypeChange,
  onPriceChange,
  onExpirationDateChange,
}: InfoModifyCardProps) => {
  const [localGiftCardName, setLocalGiftCardName] = useState(giftCardName);
  const [localBarcode, setLocalBarcode] = useState(barcode);
  const [localStore, setLocalStore] = useState(store);
  const [localType, setLocalType] = useState<'product' | 'amount'>(type);
  const [localPrice, setLocalPrice] = useState(price.toString());
  const [localExpirationDate, setLocalExpirationDate] = useState(expirationDate);

  const handleGiftCardNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalGiftCardName(value);
    onGiftCardNameChange?.(value);
  };

  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalBarcode(value);
    onBarcodeChange?.(value);
  };

  const handleStoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalStore(value);
    onStoreChange?.(value);
  };

  const handleTypeChange = (newType: 'product' | 'amount') => {
    setLocalType(newType);
    onTypeChange?.(newType);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setLocalPrice(value);
    onPriceChange?.(parseInt(value) || 0);
  };

  const handleExpirationDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalExpirationDate(value);
    onExpirationDateChange?.(value);
  };

  const formatPrice = (value: string) => {
    const numValue = value.replace(/[^0-9]/g, '');
    return numValue ? parseInt(numValue).toLocaleString('ko-KR') : '';
  };

  return (
    <CardContainer>
      <ImageSection>
        <ImageCard>
          {imageUrl && <ProductImage src={imageUrl} alt="기프티콘 이미지" />}
          <EditButton onClick={onImageEdit}>
            <Image src={editIcon} alt="편집" width={18} height={18} />
          </EditButton>
        </ImageCard>
      </ImageSection>

      <FormSection>
        <FormField>
          <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>기프티콘 명</StyledText>
          <Input
            type="text"
            value={localGiftCardName}
            onChange={handleGiftCardNameChange}
            placeholder="기프티콘 명을 입력하세요"
          />
        </FormField>

        <FormField>
          <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>바코드</StyledText>
          <Input
            type="text"
            value={localBarcode}
            onChange={handleBarcodeChange}
            placeholder="바코드를 입력하세요"
          />
        </FormField>

        <FormField>
          <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>사용처</StyledText>
          <Input
            type="text"
            value={localStore}
            onChange={handleStoreChange}
            placeholder="사용처를 입력하세요"
          />
        </FormField>

        <FormField>
          <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>권종</StyledText>
          <ButtonGroup>
            <TypeButton
              isSelected={localType === 'product'}
              onClick={() => handleTypeChange('product')}
            >
              <StyledText fontSize={14} fontWeight={600} >물품 교환형</StyledText>
            </TypeButton>
            <TypeButton
              isSelected={localType === 'amount'}
              onClick={() => handleTypeChange('amount')}
            >
              <StyledText fontSize={14} fontWeight={600} >금액형</StyledText>
            </TypeButton>
          </ButtonGroup>
        </FormField>

        <FormField>
          <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>가격</StyledText>
          <Input
            type="text"
            value={formatPrice(localPrice)}
            onChange={handlePriceChange}
            placeholder="가격을 입력하세요"
          />
        </FormField>

        <FormField>
          <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>유효기간</StyledText>
          <Input
            type="text"
            value={localExpirationDate}
            onChange={handleExpirationDateChange}
            placeholder="YYYY/MM/DD"
          />
        </FormField>
      </FormSection>
    </CardContainer>
  );
};

export default InfoModifyCard;
