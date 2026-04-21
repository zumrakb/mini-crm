import React from 'react';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import HomeScreen from '../screens/HomeScreen';
import TermListScreen from '../screens/TermListScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CustomerStackNavigator from './stacks/CustomerStack';
import { RootTabParamList } from '../types/navigation';
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
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.divider,
            height: 68,
            paddingBottom: 10,
            paddingTop: 8,
            shadowColor: colors.shadow,
            shadowOpacity: isDark ? 0.16 : 0,
            shadowRadius: isDark ? 20 : 0,
            shadowOffset: {
              width: 0,
              height: isDark ? -8 : 0,
            },
            elevation: isDark ? 10 : 0,
          },
          tabBarItemStyle: {
            alignItems: 'center',
            justifyContent: 'center',
          },
          tabBarIconStyle: {
            marginBottom: 2,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.muted,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          tabBarIcon: ({ color, size }) => {
            const iconSize = size ?? 22;
            switch (route.name) {
              case 'Home':
                return <Ionicons name="home-outline" size={iconSize} color={color} />;
              case 'Customers':
                return <Ionicons name="people-outline" size={iconSize} color={color} />;
              case 'Terms':
                return <Ionicons name="calendar-outline" size={iconSize} color={color} />;
              case 'Settings':
                return <Ionicons name="settings-outline" size={iconSize} color={color} />;
              default:
                return <Ionicons name="ellipse-outline" size={iconSize} color={color} />;
            }
          },
        })}
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
