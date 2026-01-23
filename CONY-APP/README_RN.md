# CONY-APP React Native 변환 가이드

## 설치 필요한 패키지

다음 패키지들을 설치해야 합니다:

```bash
npm install react-native-svg @react-native-clipboard/clipboard
```

또는

```bash
yarn add react-native-svg @react-native-clipboard/clipboard
```

### iOS의 경우

```bash
cd ios && pod install && cd ..
```

## 주요 변환 사항

### 1. 스타일링
- `styled-components` → `StyleSheet.create()` 또는 inline styles
- `div` → `View`
- `p`, `span` → `Text`
- `button` → `TouchableOpacity` 또는 `Pressable`
- `img` → `Image`
- `input` → `TextInput`

### 2. SVG 아이콘
- 웹의 SVG → `react-native-svg` 사용
- 모든 아이콘 컴포넌트를 `react-native-svg`로 변환

### 3. 레이아웃
- `position: sticky` → React Native에서는 `Animated` 또는 다른 방식으로 구현 필요
- `aspectRatio` → 직접 계산하여 height 지정
- `flexbox` → React Native의 Flexbox 사용 (약간의 차이 있음)

### 4. 이벤트 핸들링
- `onClick` → `onPress`
- `onChange` → `onChangeText` (TextInput의 경우)
- `e.stopPropagation()` → React Native에서는 필요 없음

### 5. 클립보드
- 웹의 `navigator.clipboard` → `@react-native-clipboard/clipboard`

## 사용 방법

`App.tsx`를 수정하여 `CouponList` 컴포넌트를 사용하세요:

```tsx
import CouponList from './src/page/couponBox/CouponList';

// App.tsx에서
<CouponList />
```

## 주의사항

1. **이미지**: 바코드 이미지와 프로필 이미지는 실제 이미지 경로로 교체해야 합니다.
2. **스타일링**: 일부 웹 전용 스타일은 React Native에서 다르게 동작할 수 있습니다.
3. **네비게이션**: 실제 앱에서는 React Navigation 등을 사용하여 네비게이션을 구현해야 합니다.
