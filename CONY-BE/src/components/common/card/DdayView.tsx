import styled from "styled-components";
import { COLORS } from "@/constants/colors";
import { SizeType } from "@/types/common";

const DdayContainer = styled.div<{ size: number }>`
  background-color: #FFFFFF;
  border-radius: 100px;
  padding: 3px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: ${props => props.size}px;
  background-color: ${COLORS.primary};
`;

const DdayText = styled.p<{ size: number }>`
  font-family: 'pretendard', sans-serif;
  font-size: ${props => props.size}px;
  font-weight: 700;
  color: ${COLORS.text.white};
`;

const DdayView = ({ dday, size }: { dday: number, size: SizeType }) => {
  console.log(size);
  return (
    <DdayContainer size={size === 'Small' ? 65 : size === 'Medium' ? 75 : 90}>
      <DdayText size={size === 'Small' ? 12 : size === 'Medium' ? 14 : 20}>D-{dday}</DdayText>
    </DdayContainer>
  );
};

export default DdayView;