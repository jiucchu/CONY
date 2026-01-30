import { Platform } from 'react-native';

/**
 * 모바일 기기 감지 유틸리티 (React Native)
 */
export const isMobileDevice = (): boolean => {
  return Platform.OS === 'ios' || Platform.OS === 'android';
};

/**
 * iOS 기기 감지
 */
export const isIOS = (): boolean => {
  return Platform.OS === 'ios';
};

/**
 * Android 기기 감지
 */
export const isAndroid = (): boolean => {
  return Platform.OS === 'android';
};
