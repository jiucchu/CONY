'use client';

import styled from "styled-components";
import { COLORS } from "@/constants/colors";
import { useState, useEffect } from "react";
import Image from "next/image";
import editIcon from "@/assets/icons/edit.svg";
import { StyledText } from "@/utils/StyledText";
import AutoSellInfo from "./atomic/AutoSellInfo";
import FolderSelector from "./FolderSelector";
import { FolderData } from "@/types/coupon/coupon";

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
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${COLORS.white};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15);

  &:hover {
    background-color: ${COLORS.background.lightGray};
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.95);
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
  font-size: 16px;
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
    font-size: 16px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const TypeButton = styled.button<{ $isSelected: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid ${props => props.$isSelected ? COLORS.primary : COLORS.background.lightGray};
  border-radius: 8px;
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.$isSelected ? COLORS.white : COLORS.text.primary};
  background-color: ${props => props.$isSelected ? COLORS.primary : COLORS.white};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${COLORS.primary};
    ${props => !props.$isSelected && `
      color: ${COLORS.primary};
    `}
  }
`;

interface InfoModifyCardProps {
  imageUrl?: string;
  giftCardName?: string;
  barcode?: string;
  store?: string;
  categoryName?: string;
  type?: 'product' | 'amount';
  price?: number;
  expirationDate?: string;
  onImageEdit?: () => void;
  onGiftCardNameChange?: (value: string) => void;
  onBarcodeChange?: (value: string) => void;
  onStoreChange?: (value: string) => void;
  onCategoryNameChange?: (value: string) => void;
  onTypeChange?: (type: 'product' | 'amount') => void;
  onPriceChange?: (value: number) => void;
  onExpirationDateChange?: (value: string) => void;
}

const InfoModifyCard = ({
  imageUrl = '',
  giftCardName = '',
  barcode = '',
  store = '',
  categoryName = '',
  type = 'product',
  price = 0,
  expirationDate = '',
  onImageEdit,
  onGiftCardNameChange,
  onBarcodeChange,
  onStoreChange,
  onCategoryNameChange,
  onTypeChange,
  onPriceChange,
  onExpirationDateChange,
}: InfoModifyCardProps) => {
  const [localGiftCardName, setLocalGiftCardName] = useState(giftCardName);
  const [localBarcode, setLocalBarcode] = useState(barcode);
  const [localStore, setLocalStore] = useState(store);
  const [localCategoryName, setLocalCategoryName] = useState(categoryName);
  const [localType, setLocalType] = useState<'product' | 'amount'>(type);
  const [localPrice, setLocalPrice] = useState(price.toString());
  const [localExpirationDate, setLocalExpirationDate] = useState(expirationDate);

  useEffect(() => {
    setLocalGiftCardName(giftCardName);
  }, [giftCardName]);

  useEffect(() => {
    setLocalBarcode(barcode);
  }, [barcode]);

  useEffect(() => {
    setLocalStore(store);
  }, [store]);

  useEffect(() => {
    setLocalCategoryName(categoryName);
  }, [categoryName]);

  useEffect(() => {
    setLocalType(type);
  }, [type]);

  useEffect(() => {
    setLocalPrice(price.toString());
  }, [price]);

  useEffect(() => {
    setLocalExpirationDate(expirationDate);
  }, [expirationDate]);

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

  const handleCategoryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalCategoryName(value);
    onCategoryNameChange?.(value);
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
    // HTML date input은 YYYY-MM-DD 형식으로 반환하므로 그대로 전달
    onExpirationDateChange?.(value);
  };

  // 날짜 형식 변환 (YYYY-MM-DD <-> YYYY/MM/DD)
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    // YYYY/MM/DD 형식을 YYYY-MM-DD로 변환
    if (dateString.includes('/')) {
      return dateString.replace(/\//g, '-');
    }
    return dateString;
  };

  const formatPrice = (value: string) => {
    const numValue = value.replace(/[^0-9]/g, '');
    return numValue ? parseInt(numValue).toLocaleString('ko-KR') : '';
  };

  const handleFolderSelect = (folderId: string) => {
    console.log(folderId);
  };
  const folders = [
    { id: '1', title: '폴더1' },
    { id: '2', title: '폴더2' },
    { id: '3', title: '폴더3' },
  ];
  const selectedFolderId = '1';

  const folderData: FolderData[] = folders.map(folder => ({
    id: folder.id,
    title: folder.title,
    type: 'selected',
  }));

 
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
      <FolderSelector folders={folderData} selectedFolderId={selectedFolderId} onSelect={handleFolderSelect} />
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
          <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>카테고리</StyledText>
          <Input
            type="text"
            value={localCategoryName}
            onChange={handleCategoryNameChange}
            placeholder="카테고리를 입력하세요 (예: 카페, 음식점 등)"
          />
        </FormField>

        <FormField>
          <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>권종</StyledText>
          <ButtonGroup>
            <TypeButton
              $isSelected={localType === 'product'}
              onClick={() => handleTypeChange('product')}
            >
              <StyledText fontSize={14} fontWeight={600} >물품 교환형</StyledText>
            </TypeButton>
            <TypeButton
              $isSelected={localType === 'amount'}
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
            type="date"
            value={formatDateForInput(localExpirationDate)}
            onChange={handleExpirationDateChange}
            min={new Date().toISOString().split('T')[0]}
          />
        </FormField>

        <AutoSellInfo />
      </FormSection>
    </CardContainer>
  );
};

export default InfoModifyCard;
