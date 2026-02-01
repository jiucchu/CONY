/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainPage from './src/page/manage/main/MainPage';
import CouponList from './src/page/couponBox/CouponList';
import Mypage from './src/page/mypage/Mypage';
import PaymentMain from './src/page/payment/main/Main';
import CouponCreate from './src/page/manage/crud/CouponCreate';
import CouponDetail from './src/page/manage/crud/CouponDetail';
import CouponModify from './src/page/manage/crud/CouponModify';
import PaymentDetail from './src/page/payment/detail/Detail';
import LoginPage from './src/page/auth/LoginPage';
import OAuthCallback from './src/page/auth/OAuthCallback';
import AlertPage from './src/page/mypage/AlertPage';

const Stack = createStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <Stack.Navigator
          initialRouteName="MainPage"
          screenOptions={{
            headerShown: false,
          }}
        >
          {/* 웹과 동일한 라우팅 구조 */}
          <Stack.Screen name="MainPage" component={MainPage} />
          <Stack.Screen name="CouponList" component={CouponList} />
          <Stack.Screen name="Mypage" component={Mypage} />
          <Stack.Screen name="PaymentMain" component={PaymentMain} />
          <Stack.Screen name="CouponCreate" component={CouponCreate} />
          <Stack.Screen name="CouponDetail" component={CouponDetail} />
          <Stack.Screen name="CouponModify" component={CouponModify} />
          <Stack.Screen name="PaymentDetail" component={PaymentDetail} />
          <Stack.Screen name="LoginPage" component={LoginPage} />
          <Stack.Screen name="OAuthCallback" component={OAuthCallback} />
          <Stack.Screen name="AlertPage" component={AlertPage} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
