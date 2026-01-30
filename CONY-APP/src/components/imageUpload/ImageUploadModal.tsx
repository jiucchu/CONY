import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '@/constants/colors';
import SelectedImageBar from './SelectedImageBar';
import ImageSelect from './atomic/ImageSelect';
import { DefaultButton } from '../common/atomic/Button';
import { StyledText } from '@/utils/StyledText';

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    position: 'relative',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  handleBar: {
    position: 'absolute',
    top: 8,
    left: '50%',
    width: 40,
    height: 4,
    backgroundColor: COLORS.background.lightGray,
    borderRadius: 2,
    marginLeft: -20,
  },
  directUploadButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  selectedSection: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background.lightGray,
  },
  imageGrid: {
    backgroundColor: COLORS.background.white,
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageGridItem: {
    width: '30%',
    aspectRatio: 1,
  },
  buttonContainer: {
    padding: 20,
    paddingHorizontal: '20%',
  },
});

interface ImageUploadModalProps {
  images: string[];
  visible: boolean;
  onClose: () => void;
  onComplete: (selectedImages: string[]) => void;
  onDirectUpload?: () => void;
}

const ImageUploadModal = ({
  images,
  visible,
  onClose,
  onComplete,
  onDirectUpload,
}: ImageUploadModalProps) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const handleImageSelect = (imageUrl: string, selected: boolean) => {
    if (selected) {
      setSelectedImages(prev => [...prev, imageUrl]);
    } else {
      setSelectedImages(prev => prev.filter(url => url !== imageUrl));
    }
  };

  const handleImageRemove = (imageUrl: string) => {
    setSelectedImages(prev => prev.filter(url => url !== imageUrl));
  };

  const handleComplete = () => {
    onComplete(selectedImages);
    setSelectedImages([]);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <View style={styles.handleBar} />
            <TouchableOpacity style={styles.directUploadButton} onPress={onDirectUpload}>
              <StyledText fontSize={14} fontWeight={600} color={COLORS.white}>
                직접 등록하기
              </StyledText>
            </TouchableOpacity>
          </View>

          <View style={styles.selectedSection}>
            <SelectedImageBar
              images={selectedImages}
              onRemove={handleImageRemove}
            />
          </View>

          <ScrollView style={{ maxHeight: '60%' }}>
            <View style={styles.imageGrid}>
              {images.map((imageUrl) => (
                <View key={imageUrl} style={styles.imageGridItem}>
                  <ImageSelect
                    imageUrl={imageUrl}
                    isSelected={selectedImages.includes(imageUrl)}
                    onSelect={(selected) => handleImageSelect(imageUrl, selected)}
                  />
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <DefaultButton onPress={handleComplete}>선택 완료</DefaultButton>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default ImageUploadModal;
