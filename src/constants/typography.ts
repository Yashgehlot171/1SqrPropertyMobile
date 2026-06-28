import {Platform} from 'react-native';

const defaultFont = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export const typography = {
  fontFamily: {
    regular: defaultFont,
    medium: defaultFont,
    semiBold: defaultFont,
    bold: defaultFont,
  },
  fontSize: {
    vs:10,
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    display: 32,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
    display: 40,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  } as const,
};
