import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import CheckIcon from '@mui/icons-material/Check';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { Logo } from '../brand/Logo.jsx';
import { useAuth } from '../../security/AuthContext.jsx';

export const Navbar = () => {
  const {
    user,
    role,
    roleDef,
    isGuest,
    isRia,
    isAdmin,
    personas,
    switchPersona,
    logout,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [personaAnchorEl, setPersonaAnchorEl] = useState(null);

  const handleOpenPersonaMenu = (e) => {
    setPersonaAnchorEl(e.currentTarget);
  };

  const handleClosePersonaMenu = () => {
    setPersonaAnchorEl(null);
  };

  const handleSelectPersona = async (p) => {
    handleClosePersonaMenu();
    await switchPersona(p.email);
    if (p.role === 'guest') {
      navigate('/login');
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeStyle = () => {
    if (isGuest) {
      return { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' };
    }
    if (role === 'admin') {
      return { bg: '#F8FAFC', color: '#0F172A', border: '#94A3B8' };
    }
    if (role === 'compliance_officer') {
      return { bg: 'rgba(2, 132, 199, 0.08)', color: '#0369A1', border: 'rgba(2, 132, 199, 0.25)' };
    }
    if (role === 'client') {
      return { bg: 'rgba(5, 150, 105, 0.08)', color: '#065F46', border: 'rgba(5, 150, 105, 0.25)' };
    }
    return { bg: 'rgba(79, 70, 229, 0.08)', color: '#4338CA', border: 'rgba(79, 70, 229, 0.25)' };
  };

  const getRoleBadgeText = () => {
    if (isGuest) return 'Guest Visitor';
    if (user?.plan === 'pro') return 'Pro RIA';
    return roleDef?.shortLabel || role.toUpperCase();
  };

  const isNavActive = (path) => location.pathname === path;

  const roleStyle = getRoleBadgeStyle();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(16px)',
        color: 'text.primary',
        zIndex: 1100,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: '64px !important', justifyContent: 'space-between' }}>
          {/* Left: Brand Mark & Main Nav */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, md: 4 } }}>
            <RouterLink
              to="/"
              style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}
            >
              <Logo size={30} />
            </RouterLink>

            {/* Authenticated Nav items tailored to role */}
            {!isGuest && (
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.8 }}>
                <Button
                  component={RouterLink}
                  to="/dashboard"
                  startIcon={<DashboardOutlinedIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    px: 1.6,
                    py: 0.7,
                    borderRadius: 2,
                    fontSize: '0.85rem',
                    fontWeight: isNavActive('/dashboard') ? 700 : 550,
                    color: isNavActive('/dashboard') ? '#0F172A' : '#64748B',
                    bgcolor: isNavActive('/dashboard') ? '#F1F5F9' : 'transparent',
                    '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
                  }}
                >
                  {role === 'client' ? 'Authorizations' : role === 'compliance_officer' ? 'Audit Center' : 'Mandates'}
                </Button>

                <Button
                  component={RouterLink}
                  to="/requests"
                  startIcon={<AssignmentOutlinedIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    px: 1.6,
                    py: 0.7,
                    borderRadius: 2,
                    fontSize: '0.85rem',
                    fontWeight: isNavActive('/requests') ? 700 : 550,
                    color: isNavActive('/requests') ? '#0F172A' : '#64748B',
                    bgcolor: isNavActive('/requests') ? '#F1F5F9' : 'transparent',
                    '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
                  }}
                >
                  {role === 'client' ? 'Requests' : role === 'compliance_officer' ? 'Requests Scrutiny' : 'Requests Hub'}
                </Button>

                {(isRia || isAdmin || role === 'compliance_officer') && (
                  <Button
                    component={RouterLink}
                    to="/clients"
                    startIcon={<PeopleAltOutlinedIcon sx={{ fontSize: 18 }} />}
                    sx={{
                      px: 1.6,
                      py: 0.7,
                      borderRadius: 2,
                      fontSize: '0.85rem',
                      fontWeight: isNavActive('/clients') ? 700 : 550,
                      color: isNavActive('/clients') ? '#0F172A' : '#64748B',
                      bgcolor: isNavActive('/clients') ? '#F1F5F9' : 'transparent',
                      '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
                    }}
                  >
                    {role === 'compliance_officer' ? 'Audit Registry' : 'Clients'}
                  </Button>
                )}

                {(isRia || isAdmin) && (
                  <Button
                    component={RouterLink}
                    to="/settings/billing"
                    startIcon={<PaymentOutlinedIcon sx={{ fontSize: 18 }} />}
                    sx={{
                      px: 1.6,
                      py: 0.7,
                      borderRadius: 2,
                      fontSize: '0.85rem',
                      fontWeight: isNavActive('/settings/billing') ? 700 : 550,
                      color: isNavActive('/settings/billing') ? '#0F172A' : '#64748B',
                      bgcolor: isNavActive('/settings/billing') ? '#F1F5F9' : 'transparent',
                      '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
                    }}
                  >
                    Billing & Quota
                  </Button>
                )}
              </Box>
            )}

            {/* Guest Landing Navigation */}
            {isGuest && (
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
                <Button
                  component={RouterLink}
                  to="/"
                  sx={{
                    px: 1.4,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#475569',
                    '&:hover': { color: '#0F172A' },
                  }}
                >
                  Overview
                </Button>
                <Button
                  onClick={() => {
                    if (window.location.pathname !== '/') navigate('/#value-proposition');
                    else document.getElementById('value-proposition')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  sx={{
                    px: 1.4,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#475569',
                    '&:hover': { color: '#0F172A' },
                  }}
                >
                  Value Proposition
                </Button>
                <Button
                  onClick={() => {
                    if (window.location.pathname !== '/') navigate('/#how-it-works');
                    else document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  sx={{
                    px: 1.4,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#475569',
                    '&:hover': { color: '#0F172A' },
                  }}
                >
                  How It Works
                </Button>
                <Button
                  onClick={() => {
                    if (window.location.pathname !== '/') navigate('/#pricing');
                    else document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  sx={{
                    px: 1.4,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#475569',
                    '&:hover': { color: '#0F172A' },
                  }}
                >
                  Pricing
                </Button>
              </Box>
            )}
          </Box>

          {/* Right: Role Pill, Persona Selector & Account Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            {/* Minimalist WealthTech Role Badge */}
            <Box
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                alignItems: 'center',
                px: 1.2,
                py: 0.45,
                borderRadius: '6px',
                bgcolor: roleStyle.bg,
                border: '1px solid',
                borderColor: roleStyle.border,
                color: roleStyle.color,
                fontWeight: 700,
                fontSize: '0.72rem',
                letterSpacing: '0.02em',
                lineHeight: 1,
              }}
            >
              {getRoleBadgeText()}
            </Box>

            {/* Quick Persona Switcher */}
            <Button
              size="small"
              variant="outlined"
              onClick={handleOpenPersonaMenu}
              endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 1.3,
                py: 0.5,
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#334155',
                borderColor: '#CBD5E1',
                bgcolor: '#FFFFFF',
                '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' },
              }}
            >
              Switch Role
            </Button>

            <Menu
              anchorEl={personaAnchorEl}
              open={Boolean(personaAnchorEl)}
              onClose={handleClosePersonaMenu}
              PaperProps={{
                sx: {
                  minWidth: 280,
                  p: 0.5,
                  borderRadius: 3,
                  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
                  border: '1px solid #E2E8F0',
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  System Personas & Roles
                </Typography>
              </Box>
              <Divider sx={{ my: 0.5 }} />

              {personas.map((p) => {
                const isCurrent = (p.role === 'guest' && isGuest) || (!isGuest && user?.email === p.email);
                return (
                  <MenuItem
                    key={p.label}
                    onClick={() => handleSelectPersona(p)}
                    selected={isCurrent}
                    sx={{
                      py: 1,
                      px: 1.5,
                      borderRadius: 2,
                      my: 0.3,
                      '&.Mui-selected': { bgcolor: 'rgba(79, 70, 229, 0.08)' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      {isCurrent ? <CheckIcon sx={{ fontSize: 18, color: '#4F46E5' }} /> : <PersonOutlineIcon sx={{ fontSize: 18, color: '#94A3B8' }} />}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="body2" fontWeight={isCurrent ? 750 : 550} color={isCurrent ? '#0F172A' : '#334155'}>
                            {p.label}
                          </Typography>
                          <Box
                            sx={{
                              px: 0.8,
                              py: 0.2,
                              borderRadius: '4px',
                              bgcolor: isCurrent ? 'rgba(79, 70, 229, 0.15)' : '#F1F5F9',
                              color: isCurrent ? '#4F46E5' : '#64748B',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                            }}
                          >
                            {p.badge}
                          </Box>
                        </Box>
                      }
                      secondary={p.description}
                      secondaryTypographyProps={{ variant: 'caption', sx: { color: '#64748B', display: 'block', mt: 0.3 } }}
                    />
                  </MenuItem>
                );
              })}
            </Menu>

            {/* Authenticated user profile & sign out */}
            {!isGuest ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Button
                  component={RouterLink}
                  to="/settings/profile"
                  startIcon={<AccountCircleOutlinedIcon sx={{ fontSize: 18 }} />}
                  size="small"
                  sx={{
                    display: { xs: 'none', sm: 'inline-flex' },
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    color: '#0F172A',
                    px: 1.2,
                  }}
                >
                  {role === 'client'
                    ? (user.name || 'Client')
                    : role === 'compliance_officer'
                    ? (user.name || 'Compliance')
                    : (user.sebiRegNumber || user.name || 'RIA Profile')}
                </Button>
                <IconButton
                  onClick={handleLogout}
                  size="small"
                  title="Sign Out to Guest"
                  sx={{ color: '#64748B', '&:hover': { color: '#0F172A' } }}
                >
                  <LogoutIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  size="small"
                  startIcon={<LockOutlinedIcon sx={{ fontSize: 16 }} />}
                  sx={{ borderRadius: 2, fontWeight: 650, fontSize: '0.8rem' }}
                >
                  Sign In
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  size="small"
                  sx={{
                    borderRadius: 2,
                    fontWeight: 650,
                    fontSize: '0.8rem',
                    bgcolor: '#0F172A',
                    '&:hover': { bgcolor: '#1E293B' },
                  }}
                >
                  Register RIA
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
