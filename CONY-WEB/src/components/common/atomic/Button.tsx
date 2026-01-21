import { COLORS } from "@/constants/colors";
import styled from "styled-components";
import { StyledText } from "@/utils/StyledText";

const DefaultButtonContainer = styled.button`
  width: 100%;
  background-color: ${COLORS.primary};
  border-radius: 40px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

interface DefaultButtonProps {
  onClick?: () => void;
  children: string;
}

const DefaultButton = ({ onClick, children }: DefaultButtonProps) => {
  return (
        <DefaultButtonContainer onClick={onClick}>
        <StyledText fontSize={18} fontWeight={800} color={COLORS.white}>{children}</StyledText>
    </DefaultButtonContainer>
  );
};

export { DefaultButton };