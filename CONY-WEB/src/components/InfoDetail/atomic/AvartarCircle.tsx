import { COLORS } from "@/constants/colors";
import styled from "styled-components";

const AvatarCircleContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${COLORS.background.lightGray};
  flex-shrink: 0;
`;

const AvatarCircle =({ imageUrl }: { imageUrl: string }) => {
  return (
    <AvatarCircleContainer>
        <img src={imageUrl} />
    </AvatarCircleContainer>
  );
};


export default AvatarCircle;