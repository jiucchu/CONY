import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../../constants/colors';
import { StyledText } from '../../../utils/StyledText';
import { Svg, Path, Circle, Line } from 'react-native-svg';
import { goToMain } from '../../../utils/utils';

const styles = StyleSheet.create({
  container: (type: 'default' | 'back') => ({
    width: '100%',
    paddingVertical: 13,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: type === 'back' ? 'relative' : 'static',
  }),
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    position: 'absolute',
    left: '50%',
    marginLeft: -50,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
  },
  spacer: {
    width: 24,
  },
});

const BellIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.text.primary} strokeWidth={2}>
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Svg>
);

const UserIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.text.primary} strokeWidth={2}>
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.text.primary} strokeWidth={2}>
    <Line x1="19" y1="12" x2="5" y2="12" />
    <Path d="M12 19l-7-7 7-7" />
  </Svg>
);

interface HeaderProps {
  type?: 'default' | 'back';
  title?: React.ReactNode;
  onBack?: () => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  isAtTop?: boolean;
}

const Header = ({
  type = 'default',
  title,
  onBack,
  onNotificationClick,
  onProfileClick,
  isAtTop = false,
}: HeaderProps) => {
  const navigation = useNavigation();

  const handleNotificationClick = () => {
    if (onNotificationClick) {
      onNotificationClick();
    } else {
      console.log('Notification clicked');
    }
  };

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    } else {
      (navigation as any).navigate('Mypage');
    }
  };

  const handleBackPress = () => {
    if (onBack) {
      onBack();
    } else {
      if ((navigation as any).canGoBack()) {
        (navigation as any).goBack();
      }
    }
  };

  if (type === 'back') {
    return (
      <View style={styles.container(type)}>
        <TouchableOpacity style={styles.iconButton} onPress={handleBackPress}>
          <BackIcon />
        </TouchableOpacity>
        {title && (
          <View style={styles.titleContainer}>
            {typeof title === 'string' ? (
              <StyledText fontSize={18} fontWeight={600} color={COLORS.text.primary}>
                {title}
              </StyledText>
            ) : (
              title
            )}
          </View>
        )}
        <View style={styles.spacer} />
      </View>
    );
  }

  const handleLogoPress = () => {
    (navigation as any).navigate('MainPage');
  };

  return (
    <View style={styles.container(type)}>
      <TouchableOpacity onPress={handleLogoPress}>
        <StyledText fontSize={20} fontWeight={900} color={isAtTop ? COLORS.white : COLORS.text.primary}>
          CONY
        </StyledText>
      </TouchableOpacity>
      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={handleNotificationClick}>
          <BellIcon />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={handleProfileClick}>
          <UserIcon />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;
