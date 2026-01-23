'use client';

import styled from "styled-components";
import { COLORS } from "@/constants/colors";
import { useState } from "react";
import AvatarCircle from "./atomic/AvartarCircle";

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
`;

const InputWrapper = styled.div`
  flex: 1;
  position: relative;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${COLORS.background.lightGray};
  border-radius: 20px;
  background-color: ${COLORS.white};
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: ${COLORS.text.primary};
  outline: none;
  transition: border-color 0.2s;

  &::placeholder {
    color: ${COLORS.text.secondary};
  }

  &:focus {
    border-color: ${COLORS.primary};
  }
`;

interface MemoInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  avatarUrl?: string;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const MemoInput = ({ 
  value, 
  onChange, 
  placeholder = "메모를 작성해주세요" ,
  avatarUrl,
  onKeyPress
}: MemoInputProps) => {
  const [internalValue, setInternalValue] = useState(value || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange?.(newValue);
  };


  return (
    <InputContainer>
        <AvatarCircle imageUrl={avatarUrl || ''} />
        <InputWrapper>
        <StyledInput
          type="text"
          value={value !== undefined ? value : internalValue}
          onChange={handleChange}
          onKeyPress={onKeyPress}
          placeholder={placeholder}
        />
      </InputWrapper>
    </InputContainer>
  );
};

export default MemoInput;
