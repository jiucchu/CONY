import React from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';

const styles = StyleSheet.create({
  container: {
    width: '90%',
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.background.gray,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

interface LogoutButtonProps {
  onPress?: () => void;
}

const LogoutButton = ({ onPress }: LogoutButtonProps) => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    if (onPress) {
      onPress();
      return;
    }

    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              // 토큰 제거
              await AsyncStorage.removeItem('accessToken');
              await AsyncStorage.removeItem('refreshToken');
              
              // 로그인 페이지로 이동
              (navigation as any).reset({
                index: 0,
                routes: [{ name: 'LoginPage' }],
              });
            } catch (error) {
              console.error('로그아웃 오류:', error);
              Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleLogout}>
      <StyledText fontSize={16} fontWeight={600} color={COLORS.text.primary}>
        로그아웃
      </StyledText>
    </TouchableOpacity>
  );
};

export default LogoutButton;
