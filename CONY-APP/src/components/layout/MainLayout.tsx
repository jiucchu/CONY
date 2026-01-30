import React, { ReactNode } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Header from '@/components/common/header/Header';
import Footer from '@/components/common/footer/Footer';
import { COLORS } from '@/constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    borderBottomColor: COLORS.background.lightGray,
  },
  headerSectionAtTop: {
    borderBottomWidth: 0,
    backgroundColor: COLORS.primary,
  },
  headerSectionScrolled: {
    borderBottomWidth: 1,
    backgroundColor: COLORS.white,
  },
  contentSection: {
    flex: 1,
  },
  footerSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.background.lightGray,
    backgroundColor: COLORS.white,
  },
});

interface MainLayoutProps {
  children: ReactNode;
  headerType?: 'default' | 'back';
  headerTitle?: ReactNode;
  onBack?: () => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  onScroll?: (scrollTop: number) => void;
  isAtTop?: boolean;
}

const MainLayout = ({
  children,
  headerType = 'default',
  headerTitle,
  onBack,
  onNotificationClick,
  onProfileClick,
  onScroll,
  isAtTop = false,
}: MainLayoutProps) => {
  return (
    <View style={styles.container}>
      <View style={[styles.headerSection, isAtTop ? styles.headerSectionAtTop : styles.headerSectionScrolled]}>
        <Header
          type={headerType}
          title={headerTitle}
          onBack={onBack}
          onNotificationClick={onNotificationClick}
          onProfileClick={onProfileClick}
          isAtTop={isAtTop}
        />
      </View>
      <ScrollView
        style={styles.contentSection}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          const scrollTop = event.nativeEvent.contentOffset.y;
          onScroll?.(scrollTop);
        }}
        scrollEventThrottle={16}
      >
        {children}
      </ScrollView>
      <View style={styles.footerSection}>
        <Footer />
      </View>
    </View>
  );
};

export default MainLayout;
