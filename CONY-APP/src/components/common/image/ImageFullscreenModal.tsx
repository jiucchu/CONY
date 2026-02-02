import React from 'react';
import { Modal, TouchableOpacity, Dimensions } from 'react-native';
import styled from 'styled-components/native';
import { Svg, Path } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.95);
  justify-content: center;
  align-items: center;
`;

const CloseButton = styled.TouchableOpacity`
  position: absolute;
  top: 50px;
  right: 20px;
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;

const CloseIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
    <Path d="M18 6L6 18M6 6l12 12" />
  </Svg>
);

const ImageContainer = styled.View`
  width: ${SCREEN_WIDTH}px;
  height: ${SCREEN_HEIGHT}px;
  justify-content: center;
  align-items: center;
`;

const FullscreenImage = styled.Image`
  width: ${SCREEN_WIDTH}px;
  height: ${SCREEN_HEIGHT}px;
`;

interface ImageFullscreenModalProps {
  visible: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

const ImageFullscreenModal = ({ visible, imageUrl, onClose }: ImageFullscreenModalProps) => {
  if (!imageUrl) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <ModalOverlay>
        <TouchableOpacity
          activeOpacity={1}
          style={{ flex: 1, width: '100%', height: '100%' }}
          onPress={onClose}
        >
          <ImageContainer>
            <FullscreenImage
              source={{ uri: imageUrl }}
              resizeMode="contain"
            />
          </ImageContainer>
        </TouchableOpacity>
        <CloseButton onPress={onClose}>
          <CloseIcon />
        </CloseButton>
      </ModalOverlay>
    </Modal>
  );
};

export default ImageFullscreenModal;
