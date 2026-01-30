import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';

const styles = StyleSheet.create({
  container: {
    width: '90%',
    borderWidth: 1,
    borderColor: COLORS.background.lightGray,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#E0E0E0',
  },
  dataRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
  },
  cell: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.background.lightGray,
  },
  lastCell: {
    borderRightWidth: 0,
  },
  headerCell: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background.lightGray,
  },
});

interface CouponStatTableProps {
  myCouponCount: number;
  sharedCouponCount: number;
  soldCouponCount: number;
}

const CouponStatTable = ({ myCouponCount, sharedCouponCount, soldCouponCount }: CouponStatTableProps) => {
  return (
    <View style={styles.container}>
      <View style={[styles.headerRow, styles.headerCell]}>
        <View style={styles.cell}>
          <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
            나의 콘
          </StyledText>
        </View>
        <View style={styles.cell}>
          <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
            공유 중
          </StyledText>
        </View>
        <View style={[styles.cell, styles.lastCell]}>
          <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
            판매 중
          </StyledText>
        </View>
      </View>
      <View style={styles.dataRow}>
        <View style={styles.cell}>
          <StyledText fontSize={14} fontWeight={400} color={COLORS.text.primary}>
            {myCouponCount} 개
          </StyledText>
        </View>
        <View style={styles.cell}>
          <StyledText fontSize={14} fontWeight={400} color={COLORS.text.primary}>
            {myCouponCount} 개
          </StyledText>
        </View>
        <View style={[styles.cell, styles.lastCell]}>
          <StyledText fontSize={14} fontWeight={400} color={COLORS.text.primary}>
            {sharedCouponCount} 개
          </StyledText>
        </View>
      </View>
    </View>
  );
};

export default CouponStatTable;
