import React from 'react';
import { View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/common/header/Header';
import AlertList from '@/components/mypage/AlertList';

const AlertPage = () => {
  const navigation = useNavigation();

  const handleBack = () => {
    (navigation as any).goBack();
  };

  return (
    <MainLayout
      headerType="back"
      headerTitle="알림"
      onBack={handleBack}
    >
      <ScrollView style={{ flex: 1 }}>
        <AlertList />
      </ScrollView>
    </MainLayout>
  );
};

export default AlertPage;
