import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import CloudQueueOutlinedIcon from '@mui/icons-material/CloudQueueOutlined';
import { Link as RouterLink } from 'react-router-dom';

export const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.mode === 'light' ? '#0A192F' : '#060D1A',
        color: '#94A3B8',
        borderTop: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ color: '#F8FAFC', fontWeight: 600 }}>
              FinConsent &copy; {new Date().getFullYear()} — Non-Discretionary Advisory Compliance Platform
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.5 }}>
              Purpose-built for SEBI (Investment Advisers) Regulations, 2013 | Regulation 19 Compliance
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Chip
              icon={<CloudQueueOutlinedIcon sx={{ color: '#10B981 !important' }} />}
              label="Data Residency: AWS Mumbai (ap-south-1)"
              size="small"
              sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', fontWeight: 600, fontSize: '0.72rem' }}
            />
            <Chip
              icon={<ShieldOutlinedIcon sx={{ color: '#38BDF8 !important' }} />}
              label="DPDP Act 2023 Compliant"
              size="small"
              sx={{ bgcolor: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8', fontWeight: 600, fontSize: '0.72rem' }}
            />
          </Stack>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Link component={RouterLink} to="/legal/privacy" sx={{ color: '#94A3B8', '&:hover': { color: '#F8FAFC' }, fontSize: '0.8rem', textDecoration: 'none' }}>
            DPDP Privacy Policy
          </Link>
          <Link component={RouterLink} to="/legal/terms" sx={{ color: '#94A3B8', '&:hover': { color: '#F8FAFC' }, fontSize: '0.8rem', textDecoration: 'none' }}>
            Terms of Service
          </Link>
          <Link component={RouterLink} to="/legal/refund" sx={{ color: '#94A3B8', '&:hover': { color: '#F8FAFC' }, fontSize: '0.8rem', textDecoration: 'none' }}>
            Refund Policy
          </Link>
          <Typography variant="caption" sx={{ color: '#64748B', ml: 'auto' }}>
            Zero Third-Party Advertising Trackers | Session Cookies Only
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
