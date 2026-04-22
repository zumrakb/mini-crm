import React from 'react';
import { Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FLOATING_TAB_BAR, SHADOWS, useAppTheme } from '../components/ui/theme';
import type { RootTabParamList } from '../types/navigation';

function getTabIcon(routeName: keyof RootTabParamList, focused: boolean) {
  switch (routeName) {
    case 'Home':
      return focused ? 'home' : 'home-outline';
    case 'Customers':
      return focused ? 'people' : 'people-outline';
    case 'Terms':
      return focused ? 'calendar' : 'calendar-outline';
    case 'Settings':
      return focused ? 'settings' : 'settings-outline';
    default:
      return 'ellipse-outline';
  }
}

const FloatingTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const tabBarWidth = Math.min(width - 40, 360);
  const tabBarLeft = (width - tabBarWidth) / 2;
  const tabBarBackgroundColor = isDark ? colors.surfaceAlt : '#FFFFFF';
  const activeTintColor = isDark ? colors.accent : colors.accentMuted;
  const inactiveTintColor = isDark ? colors.muted : '#7C8AA0';

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <View
        style={{
          position: 'absolute',
          left: tabBarLeft,
          bottom: Math.max(insets.bottom, FLOATING_TAB_BAR.offset),
          width: tabBarWidth,
          height: FLOATING_TAB_BAR.height,
          borderRadius: 24,
          backgroundColor: tabBarBackgroundColor,
          paddingHorizontal: 8,
          paddingVertical: 6,
          flexDirection: 'row',
          alignItems: 'center',
          ...SHADOWS.modalSheetStrong,
        }}
      >
        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          const isFocused = state.index === index;
          const label =
            typeof descriptor.options.tabBarLabel === 'string'
              ? descriptor.options.tabBarLabel
              : typeof descriptor.options.title === 'string'
                ? descriptor.options.title
                : route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const tintColor = isFocused
            ? activeTintColor
            : inactiveTintColor;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={descriptor.options.tabBarAccessibilityLabel}
              testID={descriptor.options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              activeOpacity={0.85}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
              }}
            >
              <Ionicons
                name={getTabIcon(route.name as keyof RootTabParamList, isFocused)}
                size={22}
                color={tintColor}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: tintColor,
                }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default FloatingTabBar;
