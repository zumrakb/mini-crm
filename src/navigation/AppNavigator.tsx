import React from 'react';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import HomeScreen from '../screens/HomeScreen';
import TermListScreen from '../screens/TermListScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CustomerStackNavigator from './stacks/CustomerStack';
import { RootTabParamList } from '../types/navigation';
import FloatingTabBar from './FloatingTabBar';
import { useAppTheme } from '../components/ui/theme';

const Tab = createBottomTabNavigator<RootTabParamList>();

const AppNavigator: React.FC = () => {
  const { t } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const navigationTheme = {
    ...(isDark ? NavigationDarkTheme : NavigationDefaultTheme),
    colors: {
      ...(isDark ? NavigationDarkTheme.colors : NavigationDefaultTheme.colors),
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.divider,
      primary: colors.accent,
      notification: colors.accent,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        initialRouteName="Home"
        tabBar={props => <FloatingTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: t('common.home'),
            tabBarLabel: t('common.home'),
          }}
        />
        <Tab.Screen
          name="Customers"
          component={CustomerStackNavigator}
          options={{
            title: t('common.customers'),
            tabBarLabel: t('common.customers'),
          }}
        />
        <Tab.Screen
          name="Terms"
          component={TermListScreen}
          options={{
            title: t('common.terms'),
            tabBarLabel: t('common.terms'),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: t('common.settings'),
            tabBarLabel: t('common.settings'),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
