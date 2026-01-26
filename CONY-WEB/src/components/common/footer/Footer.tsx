'use client';

import styled from "styled-components";
import { COLORS } from "@/constants/colors";
import { StyledText } from "@/utils/StyledText";
import { useState, useRef, useEffect } from "react";
import ImageUploadModal from "@/components/imageUpload/ImageUploadModal";
import { isMobileDevice } from "@/utils/device";
import { useRouter } from "next/navigation";

const FooterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 1000;
  pointer-events: none;
`;

const FooterContent = styled.div`
  width: 100%;
  background-color: ${COLORS.white};
  border-radius: 20px 20px 0 0;
  padding: 16px 20px 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  position: relative;
  box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.1);
  pointer-events: auto;
`;

const NavItem = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }
`;

const NavIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 100%;
    height: 100%;
    stroke: ${COLORS.text.primary};
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;

const CentralButton = styled.button<{ $isOpen: boolean }>`
  position: absolute;
  top: -30px;
  left: 50%;
  border: 4px solid ${COLORS.white};
  transform: translateX(-50%);
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: ${COLORS.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0px 4px 12px ${COLORS.background.lightGray};
  transition: transform 0.2s, box-shadow 0.2s;
  z-index: 10;

  &:hover {
    transform: translateX(-50%) scale(1.05);
    box-shadow: 0px 6px 16px rgba(244, 81, 132, 0.5);
  }

  &:active {
    transform: translateX(-50%) scale(0.95);
  }

  svg {
    width: 28px;
    height: 28px;
    stroke: ${COLORS.white};
    fill: none;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: transform 0.3s ease;
    transform: ${props => props.$isOpen ? 'rotate(45deg)' : 'rotate(0deg)'};
  }
`;

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CardIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const BagIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const HiddenFileInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
`;

const OptionsOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 1499;
  opacity: ${props => props.$isOpen ? 1 : 0};
  pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};
  transition: opacity 0.3s ease;
`;

const OptionsContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  bottom: 15%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1500;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};
`;

const OptionButton = styled.button<{ $isVisible: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background-color: ${COLORS.white};
  border: none;
  border-radius: 30px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: ${props => props.$isVisible ? 1 : 0};
  transform: ${props => props.$isVisible ? 'translateY(0)' : 'translateY(20px)'};
  pointer-events: ${props => props.$isVisible ? 'auto' : 'none'};
  white-space: nowrap;

  &:hover {
    box-shadow: 0px 6px 16px rgba(0, 0, 0, 0.2);
    transform: translateY(-4px);
  }

  &:active {
    transform: translateY(-2px);
  }
`;

const EditIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const ImageIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const Footer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  const handleCouponBoxClick = () => {
    console.log('내 쿠폰함 clicked');
  };

  const handleAddClick = () => {
    setIsOptionsOpen(prev => !prev);
  };

  const handleOptionsOverlayClick = () => {
    setIsOptionsOpen(false);
  };

  const handleDirectInput = () => {
    setIsOptionsOpen(false);
    router.push('/coupon/create');
  };

  const handleImageUpload = () => {
    setIsOptionsOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const imagePromises = Array.from(files).map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              resolve(e.target.result as string);
            } else {
              reject(new Error('파일 읽기 실패'));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      Promise.all(imagePromises)
        .then((imageUrls) => {
          setGalleryImages(imageUrls);
          setIsModalOpen(true);
        })
        .catch((error) => {
          console.error('이미지 로드 오류:', error);
        });
    }
  };

  const handleDirectUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageComplete = (selectedImages: string[]) => {
    console.log('선택된 이미지:', selectedImages);
    setIsModalOpen(false);
    setGalleryImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setGalleryImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExchangeClick = () => {
    router.push('/payment/main');
  };

  return (
    <>
      <HiddenFileInput
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        {...(isMobile && {
          // 모바일에서 갤러리 접근을 위한 추가 속성
          capture: undefined, // undefined로 설정하여 갤러리 선택 옵션 제공
        })}
      />
      <FooterContainer>
        <FooterContent>
          <NavItem onClick={handleCouponBoxClick}>
            <NavIcon>
              <CardIcon />
            </NavIcon>
            <StyledText fontSize={12} fontWeight={500} color={COLORS.text.primary}>
              내 쿠폰함
            </StyledText>
          </NavItem>

          <CentralButton onClick={handleAddClick} $isOpen={isOptionsOpen} aria-label="추가">
            <PlusIcon />
          </CentralButton>

          <NavItem onClick={handleExchangeClick}>
            <NavIcon>
              <BagIcon />
            </NavIcon>
            <StyledText fontSize={12} fontWeight={500} color={COLORS.text.primary}>
              콘 거래소
            </StyledText>
          </NavItem>
        </FooterContent>
      </FooterContainer>
      <OptionsOverlay $isOpen={isOptionsOpen} onClick={handleOptionsOverlayClick} />
      <OptionsContainer $isOpen={isOptionsOpen}>
        <OptionButton 
          $isVisible={isOptionsOpen} 
          onClick={handleImageUpload}
          style={{ transitionDelay: isOptionsOpen ? '0.1s' : '0s' }}
        >
          <ImageIcon />
          <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
            이미지로 자동 등록하기
          </StyledText>
        </OptionButton>
        
        <OptionButton 
          $isVisible={isOptionsOpen} 
          onClick={handleDirectInput}
          style={{ transitionDelay: isOptionsOpen ? '0s' : '0.1s' }}
        >
          <EditIcon />
          <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
            직접 입력하기
          </StyledText>
        </OptionButton>
      </OptionsContainer>
      {isModalOpen && (
        <ImageUploadModal
          images={galleryImages}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onComplete={handleImageComplete}
          onDirectUpload={handleDirectUpload}
        />
      )}
    </>
  );
};

export default Footer;
