import { createTheme } from '@mui/material/styles';

export const getTheme = (mode = 'light') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#0F172A', // Slate 900 - Deep Obsidian
        light: '#1E293B',
        dark: '#020617',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#4F46E5', // Indigo 600 - Wealth Accent
        light: '#6366F1',
        dark: '#3730A3',
        contrastText: '#FFFFFF',
      },
      success: {
        main: '#059669', // Emerald 600
        light: '#10B981',
        dark: '#047857',
        contrastText: '#FFFFFF',
      },
      warning: {
        main: '#D97706', // Amber 600
        light: '#F59E0B',
        dark: '#B45309',
        contrastText: '#FFFFFF',
      },
      info: {
        main: '#0284C7', // Sky 600
        light: '#38BDF8',
        dark: '#0369A1',
        contrastText: '#FFFFFF',
      },
      background: {
        default: mode === 'light' ? '#F8FAFC' : '#090D16', // Crisp subtle canvas
        paper: mode === 'light' ? '#FFFFFF' : '#111827',
      },
      text: {
        primary: mode === 'light' ? '#0F172A' : '#F8FAFC',
        secondary: mode === 'light' ? '#475569' : '#94A3B8',
        disabled: mode === 'light' ? '#94A3B8' : '#64748B',
      },
      divider: mode === 'light' ? '#E2E8F0' : '#1E293B',
    },
    typography: {
      fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      h1: { fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.15 },
      h2: { fontWeight: 750, letterSpacing: '-0.02em', lineHeight: 1.2 },
      h3: { fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.25 },
      h4: { fontWeight: 700, letterSpacing: '-0.012em', lineHeight: 1.3 },
      h5: { fontWeight: 650, letterSpacing: '-0.01em', lineHeight: 1.35 },
      h6: { fontWeight: 650, letterSpacing: '-0.005em', lineHeight: 1.4 },
      subtitle1: { fontWeight: 600, letterSpacing: '-0.005em', lineHeight: 1.5 },
      subtitle2: { fontWeight: 600, letterSpacing: '0em', lineHeight: 1.5 },
      body1: { fontSize: '0.9375rem', lineHeight: 1.6, color: mode === 'light' ? '#1E293B' : '#F1F5F9' },
      body2: { fontSize: '0.875rem', lineHeight: 1.55, color: mode === 'light' ? '#475569' : '#94A3B8' },
      caption: { fontSize: '0.75rem', lineHeight: 1.4, letterSpacing: '0.01em' },
      button: { textTransform: 'none', fontWeight: 650, letterSpacing: '-0.005em' },
    },
    shape: {
      borderRadius: 10,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            minHeight: 40,
            padding: '8px 18px',
            borderRadius: 10,
            boxShadow: 'none',
            fontSize: '0.875rem',
            transition: 'all 0.15s ease-in-out',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
              transform: 'translateY(-0.5px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          },
          containedPrimary: {
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#1E293B',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
            },
          },
          containedSecondary: {
            backgroundColor: '#4F46E5',
            '&:hover': {
              backgroundColor: '#4338CA',
            },
          },
          outlined: {
            borderColor: '#CBD5E1',
            color: '#0F172A',
            '&:hover': {
              borderColor: '#94A3B8',
              backgroundColor: 'rgba(241, 245, 249, 0.6)',
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            transition: 'all 0.15s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(241, 245, 249, 0.8)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            border: '1px solid',
            borderColor: '#E2E8F0',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03), 0 1px 2px rgba(15, 23, 42, 0.02)',
            backgroundImage: 'none',
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
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: '#F1F5F9',
            padding: '14px 18px',
            fontSize: '0.875rem',
          },
          head: {
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#64748B',
            backgroundColor: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'background-color 0.12s ease',
            '&:hover': {
              backgroundColor: '#F8FAFC',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 650,
            fontSize: '0.72rem',
            letterSpacing: '0.01em',
            height: 24,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundColor: '#FFFFFF',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#CBD5E1',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#94A3B8',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#4F46E5',
              borderWidth: '1.5px',
            },
          },
          input: {
            fontSize: '0.875rem',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            border: '1px solid #E2E8F0',
            boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            minHeight: 44,
          },
          indicator: {
            backgroundColor: '#0F172A',
            height: 2.5,
            borderRadius: '2px 2px 0 0',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.85rem',
            minHeight: 44,
            padding: '8px 16px',
            color: '#64748B',
            '&.Mui-selected': {
              color: '#0F172A',
              fontWeight: 700,
            },
          },
        },
      },
    },
  });

export const lightTheme = getTheme('light');
export const darkTheme = getTheme('dark');
