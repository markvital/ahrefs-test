import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    text: {
      primary: "#1a1a1a",
      secondary: "#5c5c5c",
    },
    divider: "#d9d9d9",
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
    h1: {
      fontWeight: 500,
      letterSpacing: "0.01em",
    },
    h2: {
      fontWeight: 500,
      letterSpacing: "0.01em",
    },
    h3: {
      fontWeight: 500,
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  components: {
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          backgroundColor: "#f0f0f0",
        },
        label: {
          fontWeight: 500,
          letterSpacing: "0.02em",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 12px 24px rgba(0,0,0,0.08)",
          border: "1px solid #e6e6e6",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          backgroundImage: "none",
          backgroundColor: "#ffffff",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 16px 32px rgba(0,0,0,0.12)",
          },
        },
      },
    },
    MuiLink: {
      defaultProps: {
        underline: "hover",
      },
    },
  },
});

export default theme;
