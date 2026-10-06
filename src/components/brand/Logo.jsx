import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const Logo = ({ size = 32, showText = true, textColor = 'inherit' }) => {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, textDecoration: 'none' }}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#0A192F" />
        <path d="M20 6L32 11V20C32 27.5 26.5 33.5 20 35C13.5 33.5 8 27.5 8 20V11L20 6Z" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 24L17 19L22 22L28 14" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="28" cy="14" r="2.5" fill="#10B981" />
      </svg>
      {showText && (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography
            variant="h6"
            component="span"
            sx={{
              fontWeight: 800,
              fontSize: size * 0.55,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: textColor,
            }}
          >
            FinConsent
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontSize: size * 0.28,
              fontWeight: 600,
              color: '#4F46E5',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            SEBI Reg. 19
          </Typography>
        </Box>
      )}
    </Box>
  );
};
