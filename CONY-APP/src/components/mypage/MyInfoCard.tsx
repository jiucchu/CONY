import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';
import { getUserInfo } from '@/api/user/userApi';
import { UserInfo } from '@/types/user/user';

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    width: '90%',
    borderRadius: 12,
    paddingVertical: '3%',
    paddingHorizontal: '5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarPlaceholder: {
    width: '20%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: COLORS.background.lightGray,
  },
  infoSection: {
    flex: 1,
    justifyContent: 'space-between',
  },
  nameEmailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    width: 80,
    height: 30,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
});

const MyInfoCard = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const data = await getUserInfo();
        setUserInfo(data);
      } catch (err) {
        console.error('사용자 정보 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, []);

  if (loading || !userInfo) {
    return (
      <View style={styles.container}>
        <StyledText fontSize={14} fontWeight={400} color={COLORS.text.secondary}>
          로딩 중...
        </StyledText>
      </View>
    );
  }

  const formattedBalance = userInfo.balance.toLocaleString();

  return (
    <View style={styles.container}>
      <View style={styles.avatarPlaceholder} />
      <View style={styles.infoSection}>
        <View style={styles.nameEmailContainer}>
          <StyledText fontSize={18} fontWeight={700} color={COLORS.text.primary}>
            {userInfo.name}
          </StyledText>
          <StyledText fontSize={14} fontWeight={400} color={COLORS.text.secondary}>
            {userInfo.email}
          </StyledText>
        </View>
        <View style={styles.bottomRow}>
          <View style={styles.balanceContainer}>
            <StyledText fontSize={24} fontWeight={700} color={COLORS.text.primary}>
              {formattedBalance}
            </StyledText>
            <StyledText fontSize={24} fontWeight={700} color={COLORS.primary}>
              C
            </StyledText>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <StyledText fontSize={10} fontWeight={700} color={COLORS.white}>
              정보 수정
            </StyledText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default MyInfoCard;
