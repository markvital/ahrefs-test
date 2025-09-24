import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle } from '../styles/GlobalStyle';
import { theme } from '../styles/theme';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Food Additives Catalogue</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Discover food additives, their classes, and descriptions in a clean, searchable catalogue."
        />
      </Head>
      <GlobalStyle />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
