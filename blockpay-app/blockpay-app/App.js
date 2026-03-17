import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SendMoneyScreen from './src/screens/SendMoneyScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import DepositScreen from './src/screens/DepositScreen';
import BillsScreen from './src/screens/BillsScreen';
import QRCodeScreen from './src/screens/QRCodeScreen';
import QRScannerScreen from './src/screens/QRScannerScreen';
import SecurityScreen from './src/screens/SecurityScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Send" component={SendMoneyScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Bills" component={BillsScreen} />
        <Stack.Screen name="Deposit" component={DepositScreen} />
        <Stack.Screen name="QRCode" component={QRCodeScreen} />
        <Stack.Screen name="Security" component={SecurityScreen} />
        <Stack.Screen name="Scanner" component={QRScannerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
