import styled from "styled-components";
import { COLORS } from "@/constants/colors";

const MainPageContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${COLORS.background.white};
`;

const MainPage = () => {
  return (
    <MainPageContainer>
      <h1>Main</h1>
    </MainPageContainer>
  );
};

export default MainPage;