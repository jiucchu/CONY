import React from 'react';
import styled from 'styled-components/native';

interface BarcodeButtonProps {
  width: number;
  onPress?: () => void;
}

const BarcodeButtonContainer = styled.TouchableOpacity<{ width: number }>`
  width: ${props => props.width}px;
  height: ${props => props.width}px;
  min-width: ${props => props.width}px;
  background-color: #FFFFFF;
  border-width: 2px;
  border-color: #E5E5E5;
  border-radius: 8px;
  padding: 8px;
  justify-content: center;
  align-items: center;
  align-self: center;
`;

const BarcodeImage = styled.Image`
  width: 100%;
  height: 100%;
  opacity: 0.7;
`;

const BarcodeButton: React.FC<BarcodeButtonProps> = ({ width, onPress }) => {
  // 바코드 이미지는 assets에서 가져오거나 placeholder 사용
  // 실제 프로젝트에서는 require를 사용하여 로컬 이미지를 불러올 수 있습니다
  const barcodeImageUri = 'https://via.placeholder.com/150';

  return (
    <BarcodeButtonContainer width={width} onPress={onPress} activeOpacity={0.7}>
      <BarcodeImage
        source={{ uri: barcodeImageUri }}
        resizeMode="contain"
      />
    </BarcodeButtonContainer>
  );
};

export default BarcodeButton;
