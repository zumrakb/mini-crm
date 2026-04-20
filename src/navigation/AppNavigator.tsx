import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import HomeScreen from '../screens/HomeScreen';
import TermListScreen from '../screens/TermListScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CustomerStackNavigator from './stacks/CustomerStack';
import { RootTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<RootTabParamList>();

const AppNavigator: React.FC = () => {
  const { t } = useTranslation();

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: 'rgba(11, 18, 34, 0.98)',
            height: 68,
            paddingBottom: 10,
            paddingTop: 8,
            shadowColor: '#020617',
            shadowOpacity: 0.2,
            shadowRadius: 20,
            shadowOffset: {
              width: 0,
              height: -8,
            },
            elevation: 10,
          },
          tabBarItemStyle: {
            alignItems: 'center',
            justifyContent: 'center',
          },
          tabBarIconStyle: {
            marginBottom: 2,
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
