import React from 'react';
import { StatusBar } from 'react-native';
import {
  SafeAreaView,
  type Edge,
} from 'react-native-safe-area-context';
import { useAppTheme } from './theme';

interface AppScreenProps {
  children: React.ReactNode;
  backgroundColor?: string;
  edges?: Edge[];
}

const AppScreen: React.FC<AppScreenProps> = ({
  children,
  backgroundColor,
  edges,
}) => {
  const { colors, statusBarStyle } = useAppTheme();
  const resolvedBackgroundColor = backgroundColor ?? colors.background;

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: resolvedBackgroundColor }}
      edges={edges}
    >
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={resolvedBackgroundColor}
      />
      {children}
    </SafeAreaView>
  );
};

export default AppScreen;
