'use client';

import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { ReactNode, useState } from 'react';

import { theme } from '../lib/theme';

interface ProvidersProps {
  children: ReactNode;
}

const createEmotionCache = () => {
  const cache = createCache({
    key: 'mui',
    prepend: true,
  });
  cache.compat = true;
  return cache;
};

export function Providers({ children }: ProvidersProps) {
  const [cache] = useState(createEmotionCache);

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
