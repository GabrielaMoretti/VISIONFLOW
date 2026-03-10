/**
 * VisionFlow — Design Tokens & Theme
 *
 * Dark-first cinematic theme inspired by professional editing tools.
 */

import { Platform } from 'react-native';

export const colors = {
  // Backgrounds
  bg: '#0A0A12',
  bgSurface: '#12121E',
  bgElevated: '#1A1A2E',
  bgCard: '#16162A',

  // Primary accent (warm amber — professional, premium)
  primary: '#E8943A',
  primaryLight: '#F2B76E',
  primaryDark: '#C47520',
  primaryMuted: 'rgba(232, 148, 58, 0.15)',

  // Secondary accent (teal — complementary cinematic accent)
  secondary: '#38BDF8',
  secondaryMuted: 'rgba(56, 189, 248, 0.15)',

  // Text
  textPrimary: '#F0EDE8',
  textSecondary: '#9A95A6',
  textMuted: '#5C5870',
  textInverse: '#0A0A12',

  // Borders & dividers
  border: '#2A2A40',
  borderLight: '#3A3A55',
  borderFocus: '#E8943A',

  // Status
  success: '#4ADE80',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const typography = {
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  h3: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: colors.textMuted,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
} as const;

export const shadows = {
  card: {
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
        }),
  },
  elevated: {
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.4)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 24,
          elevation: 16,
        }),
  },
} as const;

/** Backend API base URL — adjust for production */
export const API_BASE_URL = __DEV__
  ? 'http://localhost:8000'
  : 'https://api.visionflow.app';
