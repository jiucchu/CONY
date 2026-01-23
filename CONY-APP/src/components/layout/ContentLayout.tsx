import React, { ReactNode } from 'react';
import styled from 'styled-components/native';
import Header from '../common/header/Header';
import Footer from '../common/footer/Footer';

interface ContentLayoutProps {
  children: ReactNode;
}

const LayoutContainer = styled.View`
  width: 100%;
  height: 100%;
  flex: 1;
`;

const HeaderSection = styled.View`
  width: 100%;
`;

const ContentSection = styled.ScrollView`
  flex: 1;
`;

const ContentContainer = styled.View`
  flex-grow: 1;
`;

const FooterSection = styled.View`
  width: 100%;
`;

const ContentLayout: React.FC<ContentLayoutProps> = ({ children }) => {
  return (
    <LayoutContainer>
      <HeaderSection>
        <Header />
      </HeaderSection>
      <ContentSection
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ContentSection>
      <FooterSection>
        <Footer />
      </FooterSection>
    </LayoutContainer>
  );
};

export default ContentLayout;
