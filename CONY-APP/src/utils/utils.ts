import { Alert } from 'react-native';

const goBack = () => {
  // React Native에서는 네비게이션으로 처리해야 함
  // 네비게이션 객체가 필요하므로 여기서는 빈 함수로 둠
  // 실제 사용 시 navigation.goBack()을 사용해야 함
  console.log('뒤로가기');
};

const showConfirm = (
  message: string,
  buttons: Array<{ text: string; style?: 'cancel' | 'destructive' | 'default'; onPress: () => void }>
): Promise<void> => {
  return new Promise((resolve) => {
    Alert.alert(
      '',
      message,
      buttons.map(btn => ({
        text: btn.text,
        style: btn.style === 'destructive' ? 'destructive' : 'default',
        onPress: () => {
          btn.onPress();
          resolve();
        },
      })),
      { cancelable: true, onDismiss: () => resolve() }
    );
  });
};

// React Native Alert.alert와 유사한 API
const alert = (
  message: string,
  buttons?: Array<{ text: string; style?: 'cancel' | 'destructive' | 'default'; onPress: () => void }>
) => {
  if (!buttons || buttons.length === 0) {
    // 버튼이 없으면 기본 확인 버튼만
    Alert.alert('', message, [{ text: '확인' }]);
    return;
  }

  showConfirm(message, buttons);
};

const goBackWithAlert = () => {
  alert('페이지에서 나갈 시 작성한 내용이 저장되지 않습니다.', [
    {
      text: '취소',
      style: 'cancel',
      onPress: () => {
        // 취소 시 아무것도 하지 않음
      }
    },
    {
      text: '확인',
      style: 'destructive',
      onPress: () => {
        goBack();
      }
    },
  ]);
};

const goToMain = () => {
  // React Native에서는 네비게이션으로 처리해야 함
  // 네비게이션 객체가 필요하므로 여기서는 빈 함수로 둠
  console.log('메인으로 이동');
};

export { goBack, goBackWithAlert, alert, showConfirm, goToMain };
