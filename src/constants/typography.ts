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
  // Shared text roles used to keep screens on the same hierarchy.
  styles: {
    display: {fontSize: 32, lineHeight: 40, fontWeight: '700'},
    screenTitle: {fontSize: 20, lineHeight: 28, fontWeight: '700'},
    sectionTitle: {fontSize: 16, lineHeight: 24, fontWeight: '700'},
    cardTitle: {fontSize: 14, lineHeight: 20, fontWeight: '600'},
    body: {fontSize: 14, lineHeight: 20, fontWeight: '400'},
    bodySmall: {fontSize: 12, lineHeight: 18, fontWeight: '400'},
    label: {fontSize: 12, lineHeight: 16, fontWeight: '600'},
    caption: {fontSize: 10, lineHeight: 14, fontWeight: '500'},
    button: {fontSize: 14, lineHeight: 20, fontWeight: '700'},
    price: {fontSize: 20, lineHeight: 28, fontWeight: '700'},
    metric: {fontSize: 24, lineHeight: 32, fontWeight: '700'},
  } as const,
};
