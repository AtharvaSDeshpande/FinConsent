import { createTheme } from '@mui/material/styles';

export const getTheme = (mode = 'light') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#0A192F',
        light: '#1E3A8A',
        dark: '#050D1A',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#4F46E5',
        light: '#6366F1',
        dark: '#3730A3',
        contrastText: '#FFFFFF',
      },
      success: {
        main: '#059669',
        light: '#10B981',
        dark: '#047857',
        contrastText: '#FFFFFF',
      },
      warning: {
        main: '#D97706',
        light: '#F59E0B',
        dark: '#B45309',
        contrastText: '#FFFFFF',
      },
      background: {
        default: mode === 'light' ? '#F8FAFC' : '#0B132B',
        paper: mode === 'light' ? '#FFFFFF' : '#111C44',
      },
      text: {
        primary: mode === 'light' ? '#0F172A' : '#F8FAFC',
        secondary: mode === 'light' ? '#475569' : '#94A3B8',
      },
    },
    typography: {
      fontFamily: "'Inter', 'Roboto', -apple-system, sans-serif",
      h1: { fontWeight: 700, letterSpacing: '-0.02em' },
      h2: { fontWeight: 700, letterSpacing: '-0.01em' },
      h3: { fontWeight: 600, letterSpacing: '-0.01em' },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            minHeight: 44, // WCAG accessible touch target
            padding: '10px 20px',
            borderRadius: 8,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            minWidth: 44,
            minHeight: 44,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });

export const lightTheme = getTheme('light');
export const darkTheme = getTheme('dark');
