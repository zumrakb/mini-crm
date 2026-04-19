/**
 * Mini CRM - React Native App
 *
 * @format
 */
import 'react-native-gesture-handler';
import "./global.css";
import React from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import './src/i18n';

LogBox.ignoreLogs([
  'SafeAreaView has been deprecated',
]);

export default function App() {
  return (
    <SafeAreaProvider>
        <AppNavigator />
    </SafeAreaProvider>
  );
}
