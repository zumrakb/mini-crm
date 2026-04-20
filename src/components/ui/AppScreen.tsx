import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_BACKGROUND } from './theme';

interface AppScreenProps {
  children: React.ReactNode;
}

const AppScreen: React.FC<AppScreenProps> = ({ children }) => {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: APP_BACKGROUND }}>
      <StatusBar barStyle="light-content" backgroundColor={APP_BACKGROUND} />
      {children}
    </SafeAreaView>
  );
};

export default AppScreen;
