import { DefaultTheme } from 'styled-components';

const baseSpacing = 8;

export const theme: DefaultTheme = {
  colors: {
    background: '#f4f4f4',
    surface: '#ffffff',
    border: '#d8d8d8',
    textPrimary: '#111111',
    textSecondary: '#555555',
    accent: '#000000',
  },
  spacing: (multiplier: number) => `${multiplier * baseSpacing}px`,
  radii: {
    small: '8px',
    medium: '16px',
  },
  shadows: {
    card: '0 10px 30px rgba(0, 0, 0, 0.08)',
  },
};
