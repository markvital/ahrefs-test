import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import { theme } from '../styles/theme';

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html, body {
    padding: 0;
    margin: 0;
    font-family: \${({ theme: currentTheme }) => currentTheme.typography.fontFamily};
    background: \${({ theme: currentTheme }) => currentTheme.colors.background};
    color: \${({ theme: currentTheme }) => currentTheme.colors.textPrimary};
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    font-family: inherit;
  }
`;

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Ingredient Explorer</title>
        <meta
          name="description"
          content="Explore ingredient demand using search interest and Open Food Facts metadata."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <GlobalStyle />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
