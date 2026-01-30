import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';
import AvatarCircle from './atomic/AvartarCircle';

const styles = StyleSheet.create({
  container: (type: 'mine' | 'other') => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    justifyContent: type === 'mine' ? 'flex-end' : 'flex-start',
  }),
  messageBubble: (type: 'mine' | 'other') => ({
    maxWidth: '70%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: type === 'mine' ? COLORS.background.lightGray : COLORS.white,
    borderWidth: type === 'other' ? 1 : 0,
    borderColor: COLORS.background.lightGray,
  }),
});

interface MemoProps {
  type: 'mine' | 'other';
  content: string;
  avatarUrl?: string;
}

const Memo = ({ type, content, avatarUrl }: MemoProps) => {
  return (
    <View style={styles.container(type)}>
      {type === 'other' && <AvatarCircle imageUrl={avatarUrl} />}
      <View style={styles.messageBubble(type)}>
        <StyledText fontSize={14} fontWeight={400} color={COLORS.text.primary}>
          {content}
        </StyledText>
      </View>
    </View>
  );
};

export default Memo;
