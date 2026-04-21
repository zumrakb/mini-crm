import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import type { GestureResponderEvent, StyleProp, TextStyle, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CONTROL_SIZES, SMART_PDF_DARK } from './theme';

type ButtonVariant = 'primary' | 'secondary' | 'soft' | 'pill';

interface AppButtonProps {
  label: string;
  onPress?: ((event: GestureResponderEvent) => void) | undefined;
  variant?: ButtonVariant;
  disabled?: boolean;
  compact?: boolean;
  iconOnly?: boolean;
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
  description?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  activeOpacity?: number;
}

const AppButton: React.FC<AppButtonProps> = ({
  label,
  onPress,
  variant = 'secondary',
  disabled = false,
  compact = false,
  iconOnly = false,
  iconName,
  description,
  style,
  textStyle,
  activeOpacity = 0.85,
}) => {
  const isDark = SMART_PDF_DARK.statusBar === 'light-content';
  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    primary: {
      backgroundColor: SMART_PDF_DARK.accent,
    },
    secondary: {
      backgroundColor: SMART_PDF_DARK.surfaceMuted,
    },
    soft: {
      backgroundColor: SMART_PDF_DARK.accentSurface,
    },
    pill: {
      backgroundColor: SMART_PDF_DARK.surface,
    },
  };

  const labelColors: Record<ButtonVariant, string> = {
    primary: '#FFFFFF',
    secondary: SMART_PDF_DARK.text,
    soft: isDark ? SMART_PDF_DARK.text : SMART_PDF_DARK.accentMuted,
    pill: SMART_PDF_DARK.text,
  };

  const iconColors: Record<ButtonVariant, string> = {
    primary: '#FFFFFF',
    secondary: SMART_PDF_DARK.text,
    soft: isDark ? SMART_PDF_DARK.text : SMART_PDF_DARK.accentMuted,
    pill: SMART_PDF_DARK.accent,
  };

  const minHeight = compact ? CONTROL_SIZES.buttonCompact : CONTROL_SIZES.button;
  const radiusClassName = iconOnly
    ? 'rounded-full'
    : compact
      ? 'rounded-full px-4'
      : 'rounded-[20px] px-4';
  const iconSize = compact ? 16 : 18;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={activeOpacity}
      accessibilityLabel={label}
      className={`items-center justify-center ${radiusClassName}`}
      style={[
        variantStyles[variant],
        {
          minHeight,
          width: iconOnly ? minHeight : undefined,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      <View className="items-center justify-center gap-1.5">
        <View className="flex-row items-center justify-center gap-2.5">
          {iconName ? (
            <Ionicons
              name={iconName}
              size={iconSize}
              color={iconColors[variant]}
            />
          ) : null}

          {iconOnly ? null : (
            <Text
              className="text-center text-[15px] font-semibold"
              style={[{ color: labelColors[variant] }, textStyle]}
            >
              {label}
            </Text>
          )}
        </View>

        {description && !iconOnly ? (
          <Text
            className="text-center text-sm leading-5"
            style={{ color: SMART_PDF_DARK.muted }}
          >
            {description}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export default AppButton;
