import React, { useState } from 'react';
import { Alert, Platform, PermissionsAndroid, Permission, TouchableWithoutFeedback, Modal } from 'react-native';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { COLORS } from '../../../constants/colors';
import { StyledText } from '../../../utils/StyledText';
import { Svg, Path, Rect, Line, Polyline, Circle } from 'react-native-svg';
import ImageUploadModal from '../../imageUpload/ImageUploadModal';

const Container = styled.View`
  justify-content: center;
  align-items: flex-end;
  z-index: 1000;
`;

const Content = styled.View`
  width: 100%;
  background-color: ${COLORS.white};
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding-top: 16px;
  padding-bottom: 10px;
  padding-horizontal: 20px;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  position: relative;
  shadow-color: #000;
  shadow-offset: 0px -2px;
  shadow-opacity: 0.1;
  shadow-radius: 10px;
  elevation: 10;
`;

const NavItem = styled.TouchableOpacity`
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  flex: 1;
`;

const NavIcon = styled.View`
  width: 24px;
  height: 24px;
  justify-content: center;
  align-items: center;
`;

const CentralButton = styled.TouchableOpacity<{ $isOpen: boolean }>`
  position: absolute;
  top: -30px;
  left: 55%;
  width: 70px;
  height: 70px;
  border-radius: 35px;
  background-color: ${COLORS.primary};
  justify-content: center;
  align-items: center;
  border-width: 4px;
  border-color: ${COLORS.white};
  shadow-color: ${COLORS.background.lightGray};
  shadow-offset: 0px 4px;
  shadow-opacity: 1;
  shadow-radius: 12px;
  elevation: 10;
  z-index: 10;
  margin-left: -35px;
`;

const OptionsOverlay = styled.TouchableOpacity`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.3);
`;

const OptionsContainerWrapper = styled.View`
  position: absolute;
  bottom: 5%;
  padding-bottom: 80px;
  left: 50%;
  align-items: center;
  gap: 16px;
  margin-left: -100px;
`;

const OptionsContainer = styled.View`
  align-items: center;
  gap: 16px;
`;

const OptionButton = styled.TouchableOpacity<{ $isVisible: boolean }>`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding-vertical: 12px;
  padding-horizontal: 20px;
  background-color: ${COLORS.white};
  border-radius: 30px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.15;
  shadow-radius: 12px;
  elevation: 5;
  opacity: ${props => props.$isVisible ? 1 : 0};
  pointer-events: ${props => props.$isVisible ? 'auto' : 'none'};
`;

const PlusIcon = ({ isOpen }: { isOpen: boolean }) => (
  <Svg
    width={28}
    height={28}
    viewBox="0 0 24 24"
    fill="none"
    stroke={COLORS.white}
    strokeWidth={3}
    style={{ transform: [{ rotate: isOpen ? '45deg' : '0deg' }] }}
  >
    <Line x1="12" y1="5" x2="12" y2="19" />
    <Line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
);

const CardIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.text.primary} strokeWidth={2}>
    <Rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <Line x1="1" y1="10" x2="23" y2="10" />
  </Svg>
);

const BagIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.text.primary} strokeWidth={2}>
    <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <Line x1="3" y1="6" x2="21" y2="6" />
    <Path d="M16 10a4 4 0 0 1-8 0" />
  </Svg>
);

const EditIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={COLORS.text.primary} strokeWidth={2}>
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Svg>
);

const ImageIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={COLORS.text.primary} strokeWidth={2}>
    <Rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <Circle cx="8.5" cy="8.5" r="1.5" />
    <Polyline points="21 15 16 10 5 21" />
  </Svg>
);

const Footer = () => {
  const navigation = useNavigation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const handleCouponBoxClick = () => {
    (navigation as any).navigate('CouponList');
  };

  const handleAddClick = () => {
    setIsOptionsOpen(prev => !prev);
  };

  const handleOptionsOverlayClick = () => {
    setIsOptionsOpen(false);
  };

  const handleDirectInput = () => {
    setIsOptionsOpen(false);
    (navigation as any).navigate('CouponCreate');
  };

  const requestImagePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        // Android 13 (API 33) 이상에서는 READ_MEDIA_IMAGES 사용
        // Android 12 이하에서는 READ_EXTERNAL_STORAGE 사용
        const androidVersion = Platform.Version;
        let permission: Permission;
        
        if (androidVersion >= 33) {
          permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
        } else {
          permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
        }

        // 이미 권한이 있는지 확인
        const checkResult = await PermissionsAndroid.check(permission);
        if (checkResult) {
          return true;
        }

        // 권한 요청
        const granted = await PermissionsAndroid.request(
          permission,
          {
            title: '이미지 접근 권한',
            message: '이미지를 선택하기 위해 갤러리 접근 권한이 필요합니다.',
            buttonNeutral: '나중에',
            buttonNegative: '취소',
            buttonPositive: '허용',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('권한 요청 오류:', err);
        return false;
      }
    }
    // iOS는 react-native-image-picker가 자동으로 권한을 처리합니다.
    // Info.plist에 NSPhotoLibraryUsageDescription이 필요합니다.
    return true;
  };

  const handleImageUpload = async () => {
    setIsOptionsOpen(false);
    
    try {
      // 권한 요청
      const hasPermission = await requestImagePermission();
      if (!hasPermission) {
        Alert.alert(
          '권한 필요', 
          '이미지를 선택하려면 갤러리 접근 권한이 필요합니다.\n설정에서 권한을 허용해주세요.'
        );
        return;
      }

      // 이미지 라이브러리 열기
      launchImageLibrary(
        {
          mediaType: 'photo' as MediaType,
          includeBase64: false,
          maxHeight: 2000,
          maxWidth: 2000,
          quality: 0.8,
          selectionLimit: 10, // 최대 10개까지 선택 가능
        },
        (response: ImagePickerResponse) => {
          if (response.didCancel) {
            console.log('사용자가 이미지 선택을 취소했습니다.');
          } else if (response.errorCode) {
            console.error('ImagePicker Error: ', response.errorCode, response.errorMessage);
            Alert.alert('오류', `이미지 선택 중 오류가 발생했습니다: ${response.errorMessage}`);
          } else if (response.assets && response.assets.length > 0) {
            // 선택된 이미지 URI들을 배열로 변환
            const imageUris = response.assets.map(asset => asset.uri || '').filter(uri => uri !== '');
            if (imageUris.length > 0) {
              setGalleryImages(imageUris);
              setIsModalOpen(true);
            }
          }
        }
      );
    } catch (error) {
      console.error('이미지 선택 오류:', error);
      Alert.alert('오류', '이미지 선택 중 오류가 발생했습니다.');
    }
  };

  const handleImageComplete = (selectedImages: string[]) => {
    console.log('선택된 이미지:', selectedImages);
    setIsModalOpen(false);
    setGalleryImages([]);
    // 이미지 분석 및 등록 로직 추가
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setGalleryImages([]);
  };

  const handleDirectUpload = () => {
    setIsModalOpen(false);
    (navigation as any).navigate('CouponCreate');
  };

  const handleExchangeClick = () => {
    (navigation as any).navigate('PaymentMain');
  };

  return (
    <>
      <Container>
        <Content>
          <NavItem onPress={handleCouponBoxClick}>
            <NavIcon>
              <CardIcon />
            </NavIcon>
            <StyledText fontSize={12} fontWeight={500} color={COLORS.text.primary}>
              내 쿠폰함
            </StyledText>
          </NavItem>

          <CentralButton onPress={handleAddClick} $isOpen={isOptionsOpen}>
            <PlusIcon isOpen={isOptionsOpen} />
          </CentralButton>

          <NavItem onPress={handleExchangeClick}>
            <NavIcon>
              <BagIcon />
            </NavIcon>
            <StyledText fontSize={12} fontWeight={500} color={COLORS.text.primary}>
              콘 거래소
            </StyledText>
          </NavItem>
        </Content>
      </Container>

      <Modal
        visible={isOptionsOpen}
        transparent
        animationType="fade"
        onRequestClose={handleOptionsOverlayClick}
      >
        <OptionsOverlay
          activeOpacity={1}
          onPress={handleOptionsOverlayClick}
        >
          <OptionsContainerWrapper>
            <TouchableWithoutFeedback>
              <OptionsContainer>
                <OptionButton 
                  $isVisible={isOptionsOpen}
                  onPress={handleImageUpload}
                  style={{
                    transform: [{ translateY: isOptionsOpen ? 0 : 20 }],
                  }}
                >
                  <ImageIcon />
                  <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
                    이미지로 자동 등록하기
                  </StyledText>
                </OptionButton>
                <OptionButton 
                  $isVisible={isOptionsOpen}
                  onPress={handleDirectInput}
                  style={{
                    transform: [{ translateY: isOptionsOpen ? 0 : 20 }],
                  }}
                >
                  <EditIcon />
                  <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
                    직접 입력하기
                  </StyledText>
                </OptionButton>
              </OptionsContainer>
            </TouchableWithoutFeedback>
          </OptionsContainerWrapper>
        </OptionsOverlay>
      </Modal>

      <ImageUploadModal
        images={galleryImages}
        visible={isModalOpen}
        onClose={handleModalClose}
        onComplete={handleImageComplete}
        onDirectUpload={handleDirectUpload}
      />
    </>
  );
};

export default Footer;
