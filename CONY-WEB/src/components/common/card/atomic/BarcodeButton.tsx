import styled from "styled-components";
import barcodeImage from "@/assets/barcode.png";

const BarcodeButtonContainer = styled.button<{ width: number }>`
  width: ${props => props.width}px;
  height: ${props => props.width}px;
  min-width: ${props => props.width}px;
  background-color: #FFFFFF;
  border: 2px solid #E5E5E5;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  align-self: center;

  &:hover {
    background-color: #F9F9F9;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: grayscale(100%);
    opacity: 0.7;
  }
`;
const BarcodeButton = ( { width }: { width: number } ) => {
  return (
    <BarcodeButtonContainer width={width}>
      <img src={typeof barcodeImage === 'string' ? barcodeImage : barcodeImage.src} alt="barcode" />
    </BarcodeButtonContainer>
  );
};

export default BarcodeButton;