import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../types/navigation';
import HomeScreen from '../screens/HomeScreen';
import AboutScreen from '../screens/AboutScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PrivacyScreen from '../screens/PrivacyScreen';

const Tab = createBottomTabNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { t } = useTranslation();

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Dashboard"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0b1222',
            borderTopColor: 'rgba(255, 255, 255, 0.08)',
            height: 64,
            paddingBottom: 10,
          },
          tabBarActiveTintColor: '#38bdf8',
          tabBarInactiveTintColor: '#94a3b8',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          tabBarIcon: ({ color, size }) => {
            const iconSize = size ?? 22;
            switch (route.name) {
              case 'Dashboard':
                return <Ionicons name="home-outline" size={iconSize} color={color} />;
              case 'About':
                return <Ionicons name="information-circle-outline" size={iconSize} color={color} />;
              case 'Privacy':
                return <Ionicons name="lock-closed-outline" size={iconSize} color={color} />;
              case 'Settings':
                return <Ionicons name="settings-outline" size={iconSize} color={color} />;
              default:
                return <Ionicons name="ellipse-outline" size={iconSize} color={color} />;
            }
          },
        })}
      >
        <Tab.Screen
          name="Dashboard"
          component={HomeScreen}
          options={{
            title: t('common.home'),
            tabBarLabel: t('common.home'),
          }}
        />
        <Tab.Screen
          name="About"
          component={AboutScreen}
          options={{
            title: t('common.about'),
            tabBarLabel: t('common.about'),
          }}
        />
        <Tab.Screen
          name="Privacy"
          component={PrivacyScreen}
          options={{
            title: t('common.privacy'),
            tabBarLabel: t('common.privacy'),
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
