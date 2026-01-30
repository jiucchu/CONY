import React from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { COLORS } from '@/constants/colors';
import { StyledText } from '@/utils/StyledText';

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
  },
  titleSection: {
    marginBottom: 16,
  },
  searchListContainer: {
    minHeight: 100,
  },
  searchItem: {
    paddingVertical: 8,
  },
});

interface RecentSearchProps {
  visible: boolean;
  searches?: string[];
  onSearchClick?: (searchTerm: string) => void;
  onClose?: () => void;
}

const RecentSearch = ({
  visible,
  searches = [],
  onSearchClick,
  onClose,
}: RecentSearchProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.container}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.titleSection}>
            <StyledText fontSize={16} fontWeight={600} color={COLORS.text.primary}>
              최근 검색어
            </StyledText>
          </View>
          <View style={styles.searchListContainer}>
            {searches.length === 0 ? (
              <StyledText fontSize={14} fontWeight={400} color={COLORS.text.secondary}>
                최근 검색어가 없습니다.
              </StyledText>
            ) : (
              searches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.searchItem}
                  onPress={() => {
                    onSearchClick?.(search);
                    onClose?.();
                  }}
                >
                  <StyledText fontSize={14} fontWeight={400} color={COLORS.text.primary}>
                    {search}
                  </StyledText>
                </TouchableOpacity>
              ))
            )}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default RecentSearch;
