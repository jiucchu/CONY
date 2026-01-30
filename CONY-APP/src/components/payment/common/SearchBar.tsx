import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { COLORS } from '@/constants/colors';
import { Svg, Circle, Path } from 'react-native-svg';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.text.primary,
  },
  searchIcon: {
    width: 20,
    height: 20,
  },
});

const MagnifyingGlassIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={COLORS.text.primary} strokeWidth={2}>
    <Circle cx="11" cy="11" r="8" />
    <Path d="m21 21-4.35-4.35" />
  </Svg>
);

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  value?: string;
  onChange?: (value: string) => void;
  onFocusChange?: (isFocused: boolean) => void;
}

const SearchBar = ({
  placeholder = '찾고 싶은 브랜드, 물품명',
  onSearch,
  value: controlledValue,
  onChange,
  onFocusChange,
}: SearchBarProps) => {
  const [internalValue, setInternalValue] = useState('');

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = (text: string) => {
    if (isControlled) {
      onChange?.(text);
    } else {
      setInternalValue(text);
    }
  };

  const handleSubmitEditing = () => {
    onSearch?.(value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.text.secondary}
          value={value}
          onChangeText={handleChange}
          onSubmitEditing={handleSubmitEditing}
          onFocus={() => onFocusChange?.(true)}
          onBlur={() => onFocusChange?.(false)}
        />
        <View style={styles.searchIcon}>
          <MagnifyingGlassIcon />
        </View>
      </View>
    </View>
  );
};

export default SearchBar;
