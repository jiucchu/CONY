import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';
import { Svg, Path, Rect } from 'react-native-svg';
import * as Clipboard from '@react-native-clipboard/clipboard';

const styles = StyleSheet.create({
  container: {
    width: '90%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  profileIcon: (index: number) => ({
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'gray',
    borderWidth: 2,
    borderColor: COLORS.white,
    marginLeft: index > 0 ? -8 : 0,
    zIndex: 3 - index,
  }),
  iconButton: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

const EditIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={COLORS.text.primary} strokeWidth={2}>
    <Path d="M12 20h9" />
    <Path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </Svg>
);

const CopyIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={COLORS.text.primary} strokeWidth={2}>
    <Rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
);

interface ShareCouponProps {
  invitationCode?: string;
  invitedCount?: number;
  onShareClick?: () => void;
  onEditClick?: () => void;
  onCopyClick?: () => void;
}

const ShareCoupon = ({
  invitationCode = 'AD21F8',
  invitedCount = 0,
  onShareClick,
  onEditClick,
  onCopyClick,
}: ShareCouponProps) => {
  const handleCopy = () => {
    if (invitationCode) {
      try {
        Clipboard.setString(invitationCode);
        onCopyClick?.();
      } catch (error) {
        console.error('클립보드 복사 실패:', error);
      }
    }
  };

  const displayCount = Math.min(invitedCount, 3);
  const profileIcons = [
    'https://via.placeholder.com/150',
    'https://via.placeholder.com/150',
    'https://via.placeholder.com/150',
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.section} onPress={onShareClick}>
        <StyledText fontSize={16} fontWeight={600} color={COLORS.primary}>
          공유
        </StyledText>
        <View style={styles.iconGroup}>
          {profileIcons.slice(0, displayCount).map((profile, index) => (
            <View key={index} style={styles.profileIcon(index)}>
              <Image source={{ uri: profile }} style={{ width: '100%', height: '100%', borderRadius: 12 }} />
            </View>
          ))}
        </View>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={(e) => {
            e.stopPropagation();
            onEditClick?.();
          }}
        >
          <EditIcon />
        </TouchableOpacity>
      </TouchableOpacity>

      <TouchableOpacity style={styles.section} onPress={handleCopy}>
        <StyledText fontSize={14} fontWeight={400} color={COLORS.text.secondary}>
          초대 코드
        </StyledText>
        <View style={styles.codeText}>
          <StyledText fontSize={16} fontWeight={700} color={COLORS.text.primary}>
            {invitationCode}
          </StyledText>
        </View>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
        >
          <CopyIcon />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

export default ShareCoupon;
