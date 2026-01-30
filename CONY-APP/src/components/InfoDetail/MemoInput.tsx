import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { COLORS } from '@/constants/colors';
import AvatarCircle from './atomic/AvartarCircle';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  inputWrapper: {
    flex: 1,
  },
  input: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.background.lightGray,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.text.primary,
  },
});

interface MemoInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  avatarUrl?: string;
  onSubmitEditing?: () => void;
}

const MemoInput = ({
  value,
  onChange,
  placeholder = '메모를 작성해주세요',
  avatarUrl,
  onSubmitEditing,
}: MemoInputProps) => {
  const [internalValue, setInternalValue] = useState(value || '');

  const handleChange = (text: string) => {
    setInternalValue(text);
    onChange?.(text);
  };

  return (
    <View style={styles.container}>
      <AvatarCircle imageUrl={avatarUrl} />
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={value !== undefined ? value : internalValue}
          onChangeText={handleChange}
          onSubmitEditing={onSubmitEditing}
          placeholder={placeholder}
          placeholderTextColor={COLORS.text.secondary}
        />
      </View>
    </View>
  );
};

export default MemoInput;
