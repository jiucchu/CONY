'use client';

import styled from 'styled-components';
import { ReactNode } from 'react';
import Header from '@/components/common/header/Header';
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
}

const ContentLayout = ({ children }: ContentLayoutProps) => {
  return (
    <LayoutContainer>
      <HeaderSection>
        <Header />
      </HeaderSection>
      <ContentSection>{children}</ContentSection>
    </LayoutContainer>
  );
};

export default ContentLayout;
