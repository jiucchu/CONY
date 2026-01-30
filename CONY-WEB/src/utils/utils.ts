const goBack = () => {
    if (typeof window !== 'undefined') {
        window.history.back();
    }
};

const showConfirm = (
    message: string,
    buttons: Array<{ text: string; style?: 'cancel' | 'destructive' | 'default'; onPress: () => void }>
): Promise<void> => {
    return new Promise((resolve) => {
        if (typeof window !== 'undefined') {
            const result = window.confirm(message);
            if (result) {
                // 확인 버튼 클릭 시 첫 번째 destructive 또는 default 버튼 실행
                const confirmButton = buttons.find(btn => btn.style === 'destructive' || btn.style === 'default') || buttons[0];
                confirmButton?.onPress();
            } else {
                // 취소 버튼 클릭 시 cancel 버튼 실행
                const cancelButton = buttons.find(btn => btn.style === 'cancel') || buttons[buttons.length - 1];
                cancelButton?.onPress();
            }
            resolve();
        } else {
            resolve();
        }
    });
};

// React Native Alert.alert와 유사한 API
const alert = (
    message: string,
    buttons?: Array<{ text: string; style?: 'cancel' | 'destructive' | 'default'; onPress: () => void }>
) => {
    if (!buttons || buttons.length === 0) {
        // 버튼이 없으면 기본 확인 버튼만
        if (typeof window !== 'undefined') {
            window.alert(message);
        }
        return;
    }

    showConfirm(message, buttons);
};

const goBackWithAlert = () => {
    if (typeof window !== 'undefined') {
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
                    window.history.back();
                }
            },
        ]);
    }
};

const goToMain = () => {
    if (typeof window !== 'undefined') {
        window.location.href = '/';
    }
};

export { goBack, goBackWithAlert, alert, showConfirm, goToMain };