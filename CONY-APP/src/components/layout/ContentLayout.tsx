import React, { ReactNode } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Header from '../common/header/Header';
import Footer from '../common/footer/Footer';
import { COLORS } from '../../constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  headerSection: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background.lightGray,
  },
  contentSection: {
    flex: 1,
  },
  footerSection: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: COLORS.background.lightGray,
  },
});

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
  onProfileClick,
}: ContentLayoutProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Header
          type={headerType}
          title={headerTitle}
          onBack={onBack}
          onNotificationClick={onNotificationClick}
          onProfileClick={onProfileClick}
        />
      </View>
      <ScrollView style={styles.contentSection} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
      <View style={styles.footerSection}>
        <Footer />
      </View>
    </View>
  );
};

export default ContentLayout;
