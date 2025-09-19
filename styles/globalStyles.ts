import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html, body {
    padding: 0;
    margin: 0;
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background-color: #0f172a;
    color: #f8fafc;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  body {
    min-height: 100vh;
  }

  :focus-visible {
    outline: 3px solid #fbbf24;
    outline-offset: 3px;
  }
`;
