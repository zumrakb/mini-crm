import React from 'react';
import { StatusBar } from 'react-native';
import {
  SafeAreaView,
  type Edge,
} from 'react-native-safe-area-context';
import { APP_BACKGROUND } from './theme';

interface AppScreenProps {
  children: React.ReactNode;
  backgroundColor?: string;
  edges?: Edge[];
}

const AppScreen: React.FC<AppScreenProps> = ({
  children,
  backgroundColor = APP_BACKGROUND,
  edges,
}) => {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }} edges={edges}>
      <StatusBar barStyle="light-content" backgroundColor={backgroundColor} />
      {children}
    </SafeAreaView>
  );
};

export default AppScreen;
