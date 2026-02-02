/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { setupBackgroundMessageHandler } from './src/services/fcmService';

// FCM 백그라운드 메시지 핸들러 등록
setupBackgroundMessageHandler();

AppRegistry.registerComponent(appName, () => App);
