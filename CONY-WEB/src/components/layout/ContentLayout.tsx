'use client';

import styled from 'styled-components';
import { ReactNode, useRef, useEffect } from 'react';
import Header from '@/components/common/header/Header';
import Footer from '@/components/common/footer/Footer';
import { COLORS } from '@/constants/colors';
import MainLayout from './MainLayout';

const LayoutContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const HeaderSection = styled.div<{ isAtTop: boolean }>`
  position: sticky; 
  width: 100%;
  border-bottom: ${props => props.isAtTop ? 'none' : `1px solid ${COLORS.background.lightGray}`};
  transition: border-bottom 0.3s ease;
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
  onScroll?: (scrollTop: number) => void;
  contentRef?: React.RefObject<HTMLDivElement>;
  isAtTop?: boolean;
}

const ContentLayout = ({ 
  children,
  headerType = 'default',
  headerTitle,
  onBack,
  onNotificationClick,
  onProfileClick,
  onScroll,
  contentRef,
  isAtTop = false
}: ContentLayoutProps) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const scrollRef = contentRef || internalRef;

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current && onScroll) {
        onScroll(scrollRef.current.scrollTop);
      }
    };

    const contentElement = scrollRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      return () => {
        contentElement.removeEventListener('scroll', handleScroll);
      };
    }
  }, [onScroll, scrollRef]);

  return (
    <>
      {!isAtTop && (
        <HeaderSection isAtTop={isAtTop}>
          <Header 
            type={headerType}
            title={headerTitle}
            onBack={onBack}
            onNotificationClick={onNotificationClick}
            onProfileClick={onProfileClick}
            isAtTop={isAtTop}
          />
        </HeaderSection>
      )}
      <ContentSection ref={scrollRef}>
        {children}
      </ContentSection>
      <FooterSection>
        <Footer />
      </FooterSection>
    </>
  );
};

export default ContentLayout;
