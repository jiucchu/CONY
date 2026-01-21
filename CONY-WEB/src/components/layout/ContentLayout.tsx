'use client';

import styled from 'styled-components';
import { ReactNode } from 'react';
import Header from '@/components/common/header/Header';
import Footer from '@/components/common/footer/Footer';
import { COLORS } from '@/constants/colors';

const LayoutContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const HeaderSection = styled.div`
  position: sticky; 
  width: 100%;
  border-bottom: 1px solid ${COLORS.background.lightGray};
`;

const FooterSection = styled.div`
  z-index: 1000;
  position: sticky;
  bottom: 0;
  width: 100%;
  border-top: 1px solid ${COLORS.background.lightGray};
`;

const ContentSection = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

interface ContentLayoutProps {
  children: ReactNode;
  headerType?: 'default' | 'back';
  headerTitle?: ReactNode;
  onBack?: () => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
}

const ContentLayout = ({ 
  children,
  headerType = 'default',
  headerTitle,
  onBack,
  onNotificationClick,
  onProfileClick
}: ContentLayoutProps) => {
  return (
    <LayoutContainer>
      <HeaderSection>
        <Header 
          type={headerType}
          title={headerTitle}
          onBack={onBack}
          onNotificationClick={onNotificationClick}
          onProfileClick={onProfileClick}
        />
      </HeaderSection>
      <ContentSection>{children}</ContentSection>
      <FooterSection>
        <Footer />
      </FooterSection>
    </LayoutContainer>
  );
};

export default ContentLayout;
