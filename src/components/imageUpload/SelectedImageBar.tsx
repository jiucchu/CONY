import styled from "styled-components";
import SelectedImage from "./atomic/SelectedImage";

const SelectedImageBarContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 8px;
  scrollbar-width: none; /* Firefox */
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Edge */
  }
  
  > * {
    flex-shrink: 0;
  }
`;

const SelectedImageBar = ({ images }: { images: string[] }) => {
  return (
    <SelectedImageBarContainer>
      {images.map((image) => (
        <SelectedImage key={image} imageUrl={image} onRemove={() => {}} />
      ))}
    </SelectedImageBarContainer>
  );
};

export default SelectedImageBar;