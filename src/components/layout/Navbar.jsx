import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Logo } from '../brand/Logo.jsx';
import { useAuth } from '../../security/AuthContext.jsx';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', color: 'text.primary' }}>
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <RouterLink to={user ? "/dashboard" : "/"} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Logo size={32} />
          </RouterLink>
          {user && (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              <Button component={RouterLink} to="/dashboard" startIcon={<DashboardOutlinedIcon />} color="inherit">
                Dashboard
              </Button>
              <Button component={RouterLink} to="/clients" startIcon={<PeopleAltOutlinedIcon />} color="inherit">
                Clients
              </Button>
              <Button component={RouterLink} to="/settings/billing" startIcon={<PaymentOutlinedIcon />} color="inherit">
                Billing & Quota
              </Button>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {user ? (
            <>
              <Chip
                label={user.plan === 'pro' ? 'PRO RIA' : 'FREE TIER (3/3 Mandates)'}
                color={user.plan === 'pro' ? 'primary' : 'default'}
                size="small"
                variant={user.plan === 'pro' ? 'filled' : 'outlined'}
                sx={{ fontWeight: 700, fontSize: '0.7rem' }}
              />
              <Button
                component={RouterLink}
                to="/settings/profile"
                startIcon={<AccountCircleOutlinedIcon />}
                size="small"
                color="inherit"
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              >
                {user.sebiRegNumber || 'Profile'}
              </Button>
              <IconButton onClick={handleLogout} color="inherit" title="Sign Out">
                <LogoutIcon fontSize="small" />
              </IconButton>
            </>
          ) : (
            <>
              <Button component={RouterLink} to="/login" variant="outlined" size="small">
                RIA Sign In
              </Button>
              <Button component={RouterLink} to="/register" variant="contained" size="small">
                Get Started
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
