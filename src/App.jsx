import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme } from './theme/index.js';
import { AuthProvider } from './security/index.js';
import { I18nProvider } from './i18n/index.js';
import { AppRoutes } from './routes/index.jsx';

export function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <AuthProvider>
        <I18nProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </I18nProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
