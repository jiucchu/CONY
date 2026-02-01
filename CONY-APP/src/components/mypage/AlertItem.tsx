import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StyledText } from '@/utils/StyledText';
import { COLORS } from '@/constants/colors';

interface AlertItemProps {
  id: number;
  type: 'EXPIRATION' | 'LOCATION';
  brandName: string;
  productName: string;
  imageUrl: string;
  userName: string;
  remainingDays?: number;
  distance?: number;
}

const AlertItem = ({
  id,
  type,
  brandName,
  productName,
  imageUrl,
  userName,
  remainingDays,
  distance,
}: AlertItemProps) => {
  const navigation = useNavigation();

  const handlePress = () => {
    // 알림 타입에 따라 다른 페이지로 이동
    if (type === 'EXPIRATION') {
      // 만료 임박 알림은 쿠폰 상세 페이지로
      // TODO: 쿠폰 ID를 알림 데이터에 포함시켜야 함
      (navigation as any).navigate('CouponDetail', { id });
    } else if (type === 'LOCATION') {
      // 위치 기반 알림은 메인 페이지로
      (navigation as any).navigate('MainPage');
    }
  };

  const getAlertMessage = () => {
    if (type === 'EXPIRATION' && remainingDays !== undefined) {
      return `${userName}님의 ${productName}이(가) ${remainingDays}일 후 만료됩니다.`;
    } else if (type === 'LOCATION' && distance !== undefined) {
      return `${userName}님 근처 ${distance}m 거리에 ${brandName} 매장이 있습니다.`;
    }
    return `${userName}님의 ${productName}에 대한 알림입니다.`;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
      </View>
      <View style={styles.contentContainer}>
        <StyledText fontSize={14} fontWeight={600} color={COLORS.text.primary}>
          {brandName}
        </StyledText>
        <StyledText fontSize={16} fontWeight={700} color={COLORS.text.primary} style={styles.productName}>
          {productName}
        </StyledText>
        <StyledText fontSize={13} fontWeight={400} color={COLORS.text.secondary} style={styles.message}>
          {getAlertMessage()}
        </StyledText>
      </View>
      <View style={styles.badgeContainer}>
        <View style={[styles.badge, type === 'EXPIRATION' ? styles.expirationBadge : styles.locationBadge]}>
          <StyledText fontSize={11} fontWeight={600} color={COLORS.white}>
            {type === 'EXPIRATION' ? '만료임박' : '근처매장'}
          </StyledText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background.lightGray,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.background.lightGray,
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    marginTop: 4,
    marginBottom: 4,
  },
  message: {
    marginTop: 2,
  },
  badgeContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expirationBadge: {
    backgroundColor: COLORS.primary,
  },
  locationBadge: {
    backgroundColor: COLORS.secondary,
  },
});

export default AlertItem;
