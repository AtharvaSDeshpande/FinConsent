import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar.jsx';
import { Footer } from './Footer.jsx';

export const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthRoute) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#070F1E',
          backgroundImage: `
            radial-gradient(circle at 15% 20%, rgba(79, 70, 229, 0.18) 0px, transparent 40%),
            radial-gradient(circle at 85% 80%, rgba(14, 165, 233, 0.15) 0px, transparent 40%),
            radial-gradient(circle at 50% 40%, rgba(30, 58, 138, 0.12) 0px, transparent 60%)
          `,
          color: '#F8FAFC',
        }}
      >
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: { xs: 3, md: 6 },
            px: 2,
          }}
        >
          {children}
        </Box>
        <Box
          component="footer"
          sx={{
            py: 2,
            px: 3,
            textAlign: 'center',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            bgcolor: 'rgba(7, 15, 30, 0.85)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.55)', letterSpacing: '0.02em' }}>
            FinConsent • SEBI (Investment Advisers) Regulations, 2013 Statutory Compliance • Digital Personal Data Protection (DPDP) Act 2023
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, py: { xs: 2, md: 4 } }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

