import styled from "styled-components";
import { COLORS } from "@/constants/colors";

const DdayContainer = styled.div`
  background-color: #FFFFFF;
  border-radius: 100px;
  padding: 3px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 65px;
  background-color: ${COLORS.primary};
`;

const DdayText = styled.p`
  font-family: 'pretendard', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: ${COLORS.text.white};
`;

const DdayComponent = ({ dday }: { dday: number }) => {
  return (
    <DdayContainer>
      <DdayText>D-{dday}</DdayText>
    </DdayContainer>
  );
};

export default DdayComponent;