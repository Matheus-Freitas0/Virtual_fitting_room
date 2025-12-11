import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#4f46e5", // indigo-600
      dark: "#4338ca", // indigo-700
      light: "#818cf8", // indigo-400
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#10b981", // emerald-500
      dark: "#059669", // emerald-600
      light: "#34d399", // emerald-400
      contrastText: "#ffffff",
    },
    background: {
      default: "#f8fafc", // gray-50
      paper: "#ffffff",
    },
    text: {
      primary: "#1e293b", // gray-800
      secondary: "#64748b", // gray-500
    },
    error: {
      main: "#ef4444",
      light: "#fee2e2", // red-100
    },
    success: {
      main: "#10b981",
      light: "#d1fae5", // emerald-100
    },
    info: {
      main: "#4f46e5",
      light: "#eef2ff", // indigo-100
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontWeight: 800,
      fontSize: "2.5rem",
      "@media (min-width:600px)": {
        fontSize: "3rem",
      },
    },
    h2: {
      fontWeight: 700,
      fontSize: "1.875rem",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.25rem",
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 9999, // rounded-full
          padding: "12px 24px",
          boxShadow: "none",
          "&:hover": {
            boxShadow:
              "0 10px 15px -3px rgba(79, 70, 229, 0.5), 0 4px 6px -2px rgba(79, 70, 229, 0.2)",
            transform: "translateY(-1px)",
          },
          transition: "all 0.1s ease-in-out",
        },
        contained: {
          "&:hover": {
            backgroundColor: "#4338ca",
          },
        },
        outlined: {
          borderWidth: 1,
          "&:hover": {
            backgroundColor: "#4f46e5",
            color: "#ffffff",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        },
      },
    },
  },
});

export default theme;
