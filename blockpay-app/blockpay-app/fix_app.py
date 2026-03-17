f = open('App.js', 'w', encoding='utf-8', newline='\n')
f.write("""import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Send" component={DashboardScreen} />
        <Stack.Screen name="History" component={DashboardScreen} />
        <Stack.Screen name="Bills" component={DashboardScreen} />
        <Stack.Screen name="Deposit" component={DashboardScreen} />
        <Stack.Screen name="QRCode" component={DashboardScreen} />
        <Stack.Screen name="Security" component={DashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
""")
f.close()
print('App.js updated!')
