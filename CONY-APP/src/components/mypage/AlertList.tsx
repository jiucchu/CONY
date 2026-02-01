import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { StyledText } from '@/utils/StyledText';
import { COLORS } from '@/constants/colors';
import AlertItem from './AlertItem';

interface AlertData {
  id: number;
  type: 'EXPIRATION' | 'LOCATION';
  brandName: string;
  productName: string;
  imageUrl: string;
  userName: string;
  remainingDays?: number;
  distance?: number;
}

interface AlertListProps {
  alerts?: AlertData[];
}

const AlertList = ({ alerts = [] }: AlertListProps) => {
  if (!alerts || alerts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <StyledText fontSize={14} fontWeight={400} color={COLORS.text.secondary}>
          새로운 알림이 없습니다.
        </StyledText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.listContainer}>
        {alerts.map((alert) => (
          <AlertItem key={alert.id} {...alert} />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  listContainer: {
    flex: 1,
    width: '100%',
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
});

export default AlertList;
