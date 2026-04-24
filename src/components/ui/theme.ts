import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { type StatusBarStyle } from 'react-native';

const THEME_PREFERENCE_STORAGE_KEY = 'app-theme-preference';

export type AppThemePreference = 'light' | 'dark';

export const darkModeColors = {
  accent: '#6F9BB8',
  accentMuted: '#8AAFC7',
  accentSurface: '#20394A',
  background: '#0F1A22',
  surface: '#162733',
  surfaceAlt: '#1B313F',
  surfaceMuted: '#213846',
  input: '#1C3240',
  text: '#ECF1F4',
  muted: '#A8B6C0',
  divider: '#284050',
  overlay: 'rgba(15, 26, 34, 0.94)',
  backdrop: 'rgba(7, 12, 18, 0.76)',
  iconButton: '#213846',
  danger: '#EF4444',
  dangerSurface: '#331415',
  success: '#10B981',
  successSurface: '#12392C',
  secondary: '#8E8CF6',
  secondarySurface: '#29285D',
  secondaryText: '#D9D7FF',
  tertiarySurface: '#4E2721',
  tertiaryText: '#FFD9D3',
  shadow: '#02070B',
  statusBar: 'light-content' as StatusBarStyle,
};

export const lightModeColors = {
  accent: '#4F8D78',
  accentMuted: '#6CA58F',
  accentSurface: '#E4F4EC',
  background: '#F7FAF7',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F1',
  surfaceMuted: '#EBF0EB',
  input: '#FFFFFF',
  text: '#191C1B',
  muted: '#76807B',
  divider: '#E3E8E3',
  overlay: 'rgba(247, 250, 247, 0.94)',
  backdrop: 'rgba(25, 28, 27, 0.16)',
  iconButton: '#F1F5F1',
  danger: '#BA1A1A',
  dangerSurface: '#FFDAD6',
  success: '#5D9B84',
  successSurface: '#E2F3EA',
  secondary: '#7FAF9A',
  secondarySurface: '#EAF5EF',
  secondaryText: '#5F8B77',
  tertiarySurface: '#EFF7F1',
  tertiaryText: '#6D8A79',
  shadow: '#5F8B77',
  statusBar: 'dark-content' as StatusBarStyle,
};

type AppColors = typeof darkModeColors;

export const CONTROL_SIZES = {
  button: 44,
  buttonCompact: 40,
  input: 52,
  search: 46,
  textAreaMin: 112,
} as const;

export const FLOATING_TAB_BAR = {
  height: 76,
  offset: 18,
  widthPercent: '84%',
  contentPaddingBottom: 142,
} as const;

export const FEEDBACK_COLORS = {
  errorText: '#FCA5A5',
  errorTextLight: '#B91C1C',
} as const;

export const TEXT_INPUT_CLASSNAME = 'rounded-[22px] px-4 py-3 text-[15px]';

function buildShadows(colors: AppColors) {
  const isDark = colors.statusBar === 'light-content';

  return {
    soft: {
      shadowColor: colors.shadow,
      shadowOpacity: isDark ? 0.12 : 0,
      shadowRadius: isDark ? 14 : 0,
      shadowOffset: {
        width: 0,
        height: isDark ? 8 : 0,
      },
      elevation: isDark ? 2 : 0,
    },
    softAlt: {
      shadowColor: colors.shadow,
      shadowOpacity: isDark ? 0.08 : 0,
      shadowRadius: isDark ? 12 : 0,
      shadowOffset: {
        width: 0,
        height: isDark ? 6 : 0,
      },
      elevation: isDark ? 2 : 0,
    },
    floatingCompact: {
      shadowColor: colors.shadow,
      shadowOpacity: isDark ? 0.14 : 0,
      shadowRadius: isDark ? 12 : 0,
      shadowOffset: {
        width: 0,
        height: isDark ? 6 : 0,
      },
      elevation: isDark ? 2 : 0,
    },
    modalSheet: {
      shadowColor: colors.shadow,
      shadowOpacity: isDark ? 0.16 : 0,
      shadowRadius: isDark ? 18 : 0,
      shadowOffset: {
        width: 0,
        height: isDark ? -8 : 0,
      },
      elevation: isDark ? 8 : 0,
    },
    modalSheetStrong: {
      shadowColor: colors.shadow,
      shadowOpacity: isDark ? 0.28 : 0,
      shadowRadius: isDark ? 28 : 0,
      shadowOffset: {
        width: 0,
        height: isDark ? -10 : 0,
      },
      elevation: isDark ? 16 : 0,
    },
  };
}

let activeColors: AppColors = darkModeColors;
let activeShadows = buildShadows(darkModeColors);

function setResolvedTheme(colors: AppColors) {
  activeColors = colors;
  activeShadows = buildShadows(colors);
}

function getUiStyleValue(key: string) {
  switch (key) {
    case 'borderless':
      return {
        borderWidth: 0,
        borderColor: 'transparent',
      };
    case 'badge':
      return {
        backgroundColor: activeColors.accentSurface,
      };
    case 'badgeText':
      return {
        color:
          activeColors.statusBar === 'light-content'
            ? activeColors.accent
            : activeColors.accentMuted,
      };
    case 'mutedSurface':
      return {
        backgroundColor: activeColors.surfaceMuted,
        borderWidth: 0,
        borderColor: 'transparent',
      };
    case 'accentSurface':
      return {
        backgroundColor: activeColors.accentSurface,
      };
    case 'divider':
      return {
        backgroundColor: activeColors.divider,
      };
    case 'inputBase':
      return {
        backgroundColor: activeColors.input,
        color: activeColors.text,
        minHeight: CONTROL_SIZES.input,
        paddingTop: 0,
        paddingBottom: 0,
        textAlignVertical: 'center' as const,
        borderWidth: 0,
        borderColor: 'transparent',
      };
    case 'searchContainer':
      return {
        backgroundColor: activeColors.input,
        minHeight: CONTROL_SIZES.search,
        borderWidth: 0,
        borderColor: 'transparent',
      };
    case 'textArea':
      return {
        backgroundColor: activeColors.input,
        color: activeColors.text,
        minHeight: CONTROL_SIZES.textAreaMin,
        borderWidth: 0,
        borderColor: 'transparent',
      };
    case 'inputError':
      return {
        backgroundColor: activeColors.dangerSurface,
      };
    case 'modalSheet':
      return {
        backgroundColor: activeColors.background,
        ...activeShadows.modalSheet,
      };
    case 'modalSheetStrong':
      return {
        backgroundColor: activeColors.background,
        ...activeShadows.modalSheetStrong,
      };
    case 'modalSheetCompact':
      return {
        backgroundColor: activeColors.background,
        maxHeight: '88%' as const,
        borderWidth: 0,
        borderColor: 'transparent',
        ...activeShadows.modalSheetStrong,
      };
    case 'modalHandle':
      return {
        backgroundColor: activeColors.divider,
      };
    case 'titleText':
      return {
        color: activeColors.text,
      };
    case 'bodyText':
      return {
        color: activeColors.muted,
      };
    case 'errorText':
      return {
        color:
          activeColors.statusBar === 'light-content'
            ? FEEDBACK_COLORS.errorText
            : FEEDBACK_COLORS.errorTextLight,
      };
    default:
      return {};
  }
}

function getSurfaceStyleValue(key: string) {
  switch (key) {
    case 'card':
      return {
        backgroundColor: activeColors.surface,
        borderWidth: 0,
        borderColor: 'transparent',
        ...activeShadows.soft,
      };
    case 'softCard':
      return {
        backgroundColor: activeColors.surfaceAlt,
        borderWidth: 0,
        borderColor: 'transparent',
        ...activeShadows.softAlt,
      };
    case 'input':
      return {
        backgroundColor: activeColors.input,
        borderWidth: 0,
        borderColor: 'transparent',
      };
    default:
      return {};
  }
}

export const SMART_PDF_DARK = new Proxy({} as AppColors, {
  get: (_target, prop) => activeColors[prop as keyof AppColors],
});

export const SHADOWS = new Proxy({} as ReturnType<typeof buildShadows>, {
  get: (_target, prop) => activeShadows[prop as keyof typeof activeShadows],
});

export const uiStyles = new Proxy({} as Record<string, object>, {
  get: (_target, prop) => getUiStyleValue(String(prop)),
});

export const surfaceStyles = new Proxy({} as Record<string, object>, {
  get: (_target, prop) => getSurfaceStyleValue(String(prop)),
});

interface AppThemeContextValue {
  colors: AppColors;
  isDark: boolean;
  preference: AppThemePreference;
  setPreference: (preference: AppThemePreference) => Promise<void>;
  statusBarStyle: StatusBarStyle;
}

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

interface AppThemeProviderProps {
  children: React.ReactNode;
}

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const [preference, setPreferenceState] = useState<AppThemePreference>('light');

  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(THEME_PREFERENCE_STORAGE_KEY)
      .then(value => {
        if (!isMounted) {
          return;
        }

        if (value === 'light' || value === 'dark') {
          setPreferenceState(value);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const setPreference = useCallback(async (nextPreference: AppThemePreference) => {
    setPreferenceState(nextPreference);
    await AsyncStorage.setItem(THEME_PREFERENCE_STORAGE_KEY, nextPreference);
  }, []);

  const isDark = preference === 'dark';
  const colors = isDark ? darkModeColors : lightModeColors;
  setResolvedTheme(colors);

  const value = useMemo<AppThemeContextValue>(
    () => ({
      colors,
      isDark,
      preference,
      setPreference,
      statusBarStyle: colors.statusBar,
    }),
    [colors, isDark, preference, setPreference],
  );

  return React.createElement(AppThemeContext.Provider, { value }, children);
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }

  return context;
}
