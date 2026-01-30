import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  noticeContainer: {
    alignItems: 'center',
  },
  daysLeftContainer: {
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amountContainer: {
    alignItems: 'baseline',
    justifyContent: 'center',
    width: '50%',
    gap: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: COLORS.background.lightGray,
    padding: 10,
  },
  paddingSection: {
    paddingVertical: 10,
  },
});

interface AutoSellInfoCardProps {
  daysLeft: number;
  amount: number;
}

const AutoSellInfoCard = ({ daysLeft, amount }: AutoSellInfoCardProps) => {
  const formattedAmount = amount.toLocaleString('ko-KR');

  return (
    <View style={styles.container}>
      <View style={styles.paddingSection}>
        <View style={styles.noticeContainer}>
          <StyledText fontSize={12} fontWeight={400} color={COLORS.text.secondary}>
            사용 혹은 양도하신 기프티콘이시라면 사용 완료를 눌러주세요.
          </StyledText>
        </View>
        <View style={styles.daysLeftContainer}>
          <StyledText fontSize={18} fontWeight={700}>
            자동 판매 예정일까지
          </StyledText>
          <StyledText fontSize={24} fontWeight={700} color={COLORS.primary}>
            {daysLeft}
          </StyledText>
          <StyledText fontSize={18} fontWeight={700}>
            일 남았습니다.
          </StyledText>
        </View>
      </View>
      <View style={styles.amountContainer}>
        <StyledText fontSize={14} fontWeight={400} color={COLORS.text.primary}>
          판매 예정 금액
        </StyledText>
        <StyledText fontSize={14} fontWeight={900} color={COLORS.text.primary}>
          {formattedAmount}원
        </StyledText>
      </View>
    </View>
  );
};

export default AutoSellInfoCard;
