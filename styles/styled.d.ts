import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      background: string;
      surface: string;
      border: string;
      textPrimary: string;
      textSecondary: string;
      accent: string;
    };
    spacing: (multiplier: number) => string;
    radii: {
      small: string;
      medium: string;
    };
    shadows: {
      card: string;
    };
  }
}
