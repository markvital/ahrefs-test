import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html, body {
    padding: 0;
    margin: 0;
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-family: 'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  body {
    min-height: 100vh;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  ul {
    margin: 0;
    padding: 0;
  }
`;
