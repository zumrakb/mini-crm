import { StyleSheet } from 'react-native';

export const SMART_PDF_DARK = {
  accent: '#2563EB',
  accentMuted: '#1D4ED8',
  accentSurface: '#10203B',
  background: '#0B1220',
  surface: '#121A2B',
  surfaceAlt: '#16243A',
  surfaceMuted: '#1A2436',
  input: '#182235',
  text: '#F8FAFC',
  muted: '#98A6B9',
  divider: '#253248',
  overlay: 'rgba(8, 12, 20, 0.94)',
  backdrop: 'rgba(2, 6, 23, 0.72)',
  iconButton: '#1A2436',
  danger: '#EF4444',
  dangerSurface: '#331415',
} as const;

export const APP_BACKGROUND = SMART_PDF_DARK.background;

export const CONTROL_SIZES = {
  button: 48,
  buttonCompact: 40,
  input: 48,
  search: 52,
  textAreaMin: 96,
} as const;

export const FEEDBACK_COLORS = {
  errorText: '#FCA5A5',
} as const;

export const SHADOWS = {
  soft: {
    shadowColor: '#020617',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 2,
  },
  softAlt: {
    shadowColor: '#020617',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 2,
  },
  floatingCompact: {
    shadowColor: '#020617',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 2,
  },
  modalSheet: {
    shadowColor: '#020617',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: -8,
    },
    elevation: 8,
  },
  modalSheetStrong: {
    shadowColor: '#020617',
    shadowOpacity: 0.28,
    shadowRadius: 28,
    shadowOffset: {
      width: 0,
      height: -10,
    },
    elevation: 16,
  },
} as const;

export const TEXT_INPUT_CLASSNAME = 'rounded-[20px] px-4 py-3 text-[15px]';

export const uiStyles = StyleSheet.create({
  borderless: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  badge: {
    backgroundColor: SMART_PDF_DARK.accentSurface,
  },
  badgeText: {
    color: SMART_PDF_DARK.accent,
  },
  mutedSurface: {
    backgroundColor: SMART_PDF_DARK.surfaceMuted,
  },
  accentSurface: {
    backgroundColor: SMART_PDF_DARK.accentSurface,
  },
  divider: {
    backgroundColor: SMART_PDF_DARK.divider,
  },
  inputBase: {
    backgroundColor: SMART_PDF_DARK.input,
    color: SMART_PDF_DARK.text,
    minHeight: CONTROL_SIZES.input,
  },
  searchContainer: {
    backgroundColor: SMART_PDF_DARK.input,
    minHeight: CONTROL_SIZES.search,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  textArea: {
    backgroundColor: SMART_PDF_DARK.input,
    color: SMART_PDF_DARK.text,
    minHeight: CONTROL_SIZES.textAreaMin,
  },
  inputError: {
    backgroundColor: SMART_PDF_DARK.dangerSurface,
  },
  modalSheet: {
    backgroundColor: SMART_PDF_DARK.background,
    ...SHADOWS.modalSheet,
  },
  modalSheetStrong: {
    backgroundColor: SMART_PDF_DARK.background,
    ...SHADOWS.modalSheetStrong,
  },
  modalHandle: {
    backgroundColor: SMART_PDF_DARK.divider,
  },
  titleText: {
    color: SMART_PDF_DARK.text,
  },
  bodyText: {
    color: SMART_PDF_DARK.muted,
  },
  errorText: {
    color: FEEDBACK_COLORS.errorText,
  },
});

export const surfaceStyles = StyleSheet.create({
  card: {
    backgroundColor: SMART_PDF_DARK.surface,
    borderWidth: 1,
    borderColor: SMART_PDF_DARK.divider,
    ...SHADOWS.soft,
  },
  softCard: {
    backgroundColor: SMART_PDF_DARK.surfaceAlt,
    borderWidth: 1,
    borderColor: SMART_PDF_DARK.divider,
    ...SHADOWS.softAlt,
  },
  input: {
    backgroundColor: SMART_PDF_DARK.input,
    borderWidth: 1,
    borderColor: SMART_PDF_DARK.divider,
  },
});
