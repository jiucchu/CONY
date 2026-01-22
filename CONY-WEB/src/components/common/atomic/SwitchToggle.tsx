'use client';

import { styled } from "styled-components";
import { COLORS } from "@/constants/colors";

const ToggleSwitchButton = styled.button<{ $isOn: boolean }>`
  width: 48px;
  height: 28px;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  position: relative;
  background-color: ${props => props.$isOn ? COLORS.primary : COLORS.background.lightGray};
  transition: background-color 0.3s ease;
  padding: 2px;
  flex-shrink: 0;
  outline: none;

  &:focus-visible {
    outline: 2px solid ${COLORS.primary};
    outline-offset: 2px;
  }

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: ${COLORS.white};
    transition: transform 0.3s ease;
    transform: ${props => props.$isOn ? 'translateX(20px)' : 'translateX(0)'};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

interface SwitchToggleProps {
  isOn: boolean;
  onClick: () => void;
  ariaLabel?: string;
}

const SwitchToggle = ({ isOn, onClick, ariaLabel }: SwitchToggleProps) => {
  return (
    <ToggleSwitchButton
      $isOn={isOn}
      onClick={onClick}
      aria-label={ariaLabel}
      type="button"
    />
  );
};

export default SwitchToggle;