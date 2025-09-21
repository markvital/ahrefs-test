export const theme = {
  colors: {
    background: '#0d0d12',
    card: '#1b1b29',
    accent: '#ffb703',
    accentSecondary: '#8ecae6',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#312f4b',
    modalBackdrop: 'rgba(6, 7, 14, 0.8)'
  },
  layout: {
    maxWidth: '1200px'
  },
  typography: {
    fontFamily: '\"Inter\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif',
    headingWeight: 600,
    bodyWeight: 400
  }
} as const;

export type Theme = typeof theme;
