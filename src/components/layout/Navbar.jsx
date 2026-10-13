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
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { Logo } from '../brand/Logo.jsx';
import { useAuth } from '../../security/AuthContext.jsx';
import { useI18n } from '../../i18n/index.js';

export const Navbar = () => {
  const {
    user,
    role,
    roleDef,
    isGuest,
    isRia,
    isAdmin,
    logout,
  } = useAuth();
  const { language, setLanguage, t, supportedLanguages, currentLanguageInfo } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  const [langAnchorEl, setLangAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleOpenLangMenu = (e) => setLangAnchorEl(e.currentTarget);
  const handleCloseLangMenu = () => setLangAnchorEl(null);
  const handleSelectLang = (code) => {
    setLanguage(code);
    handleCloseLangMenu();
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
    if (role === 'ria') {
      return user?.firmName ? user.firmName : (user?.plan === 'pro' ? 'Pro RIA' : 'RIA Adviser');
    }
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
                  {role === 'client' ? t('nav.mandates') : role === 'compliance_officer' ? t('nav.audit_trail') : t('nav.mandates')}
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
                  {t('nav.requests')}
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
                    {t('nav.clients')}
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
                    {t('nav.billing')}
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



            {/* Language Selector Dropdown */}
            <Button
              id="navbar_language_btn"
              size="small"
              onClick={handleOpenLangMenu}
              startIcon={<TranslateOutlinedIcon sx={{ fontSize: 16 }} />}
              endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
              sx={{
                textTransform: 'none',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#475569',
                borderRadius: 2,
                px: 1.2,
                py: 0.5,
                bgcolor: 'rgba(241, 245, 249, 0.6)',
                '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
              }}
            >
              <span style={{ marginRight: '4px' }}>{currentLanguageInfo.flag}</span>
              {currentLanguageInfo.nativeName}
            </Button>
            <Menu
              id="navbar_language_menu"
              anchorEl={langAnchorEl}
              open={Boolean(langAnchorEl)}
              onClose={handleCloseLangMenu}
              PaperProps={{
                sx: { borderRadius: 2, minWidth: 200, mt: 1, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' },
              }}
            >
              {supportedLanguages.map((lang) => (
                <MenuItem
                  key={lang.code}
                  id={`nav_lang_option_${lang.code}`}
                  selected={language === lang.code}
                  onClick={() => handleSelectLang(lang.code)}
                  sx={{ py: 1 }}
                >
                  <ListItemIcon sx={{ minWidth: '32px !important', fontSize: '1.2rem' }}>
                    {lang.flag}
                  </ListItemIcon>
                  <ListItemText
                    primary={lang.nativeName}
                    secondary={lang.name}
                    primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: language === lang.code ? 700 : 500 }}
                    secondaryTypographyProps={{ fontSize: '0.72rem' }}
                  />
                  {language === lang.code && <CheckIcon sx={{ fontSize: 16, color: 'primary.main', ml: 1 }} />}
                </MenuItem>
              ))}
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
                    ? (user?.name || 'Client')
                    : role === 'compliance_officer'
                    ? (user?.name || 'Compliance')
                    : (user?.name || user?.firmName || user?.sebiRegNumber || 'RIA Profile')}
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
                  sx={{ borderRadius: 2, fontWeight: 650, fontSize: '0.8rem', whiteSpace: 'nowrap', px: 1.5, minWidth: 'auto' }}
                >
                  Sign In
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  size="small"
                  sx={{
                    display: { xs: 'none', sm: 'inline-flex' },
                    borderRadius: 2,
                    fontWeight: 650,
                    fontSize: '0.8rem',
                    bgcolor: '#0F172A',
                    whiteSpace: 'nowrap',
                    '&:hover': { bgcolor: '#1E293B' },
                  }}
                >
                  Register RIA
                </Button>
              </Box>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <IconButton
              id="navbar_mobile_menu_btn"
              aria-label="open mobile menu"
              onClick={() => setMobileOpen(true)}
              size="small"
              sx={{
                display: { xs: 'inline-flex', md: 'none' },
                color: '#0F172A',
                p: 0.8,
                borderRadius: 1.5,
                border: '1px solid #E2E8F0',
                ml: 0.5,
              }}
            >
              <MenuIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      {/* Responsive Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: 290,
            maxWidth: '85vw',
            p: 2.5,
            bgcolor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          },
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
            <Logo size={26} />
            <IconButton onClick={() => setMobileOpen(false)} size="small" sx={{ color: '#64748B' }}>
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>

          <Box sx={{ mb: 2, display: 'inline-flex', alignItems: 'center', px: 1.2, py: 0.45, borderRadius: '6px', bgcolor: roleStyle.bg, border: '1px solid', borderColor: roleStyle.border, color: roleStyle.color, fontWeight: 700, fontSize: '0.72rem' }}>
            {getRoleBadgeText()}
          </Box>

          <Divider sx={{ mb: 2 }} />

          <List disablePadding>
            {!isGuest ? (
              <>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    component={RouterLink}
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    selected={isNavActive('/dashboard')}
                    sx={{ borderRadius: 2, py: 1 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: isNavActive('/dashboard') ? 'primary.main' : '#64748B' }}>
                      <DashboardOutlinedIcon sx={{ fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText primary={role === 'client' ? t('nav.mandates') : role === 'compliance_officer' ? t('nav.audit_trail') : t('nav.mandates')} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isNavActive('/dashboard') ? 700 : 500 }} />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    component={RouterLink}
                    to="/requests"
                    onClick={() => setMobileOpen(false)}
                    selected={isNavActive('/requests')}
                    sx={{ borderRadius: 2, py: 1 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: isNavActive('/requests') ? 'primary.main' : '#64748B' }}>
                      <AssignmentOutlinedIcon sx={{ fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText primary={t('nav.requests')} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isNavActive('/requests') ? 700 : 500 }} />
                  </ListItemButton>
                </ListItem>

                {(isRia || isAdmin || role === 'compliance_officer') && (
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      component={RouterLink}
                      to="/clients"
                      onClick={() => setMobileOpen(false)}
                      selected={isNavActive('/clients')}
                      sx={{ borderRadius: 2, py: 1 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36, color: isNavActive('/clients') ? 'primary.main' : '#64748B' }}>
                        <PeopleAltOutlinedIcon sx={{ fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText primary={t('nav.clients')} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isNavActive('/clients') ? 700 : 500 }} />
                    </ListItemButton>
                  </ListItem>
                )}

                {(isRia || isAdmin) && (
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      component={RouterLink}
                      to="/settings/billing"
                      onClick={() => setMobileOpen(false)}
                      selected={isNavActive('/settings/billing')}
                      sx={{ borderRadius: 2, py: 1 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36, color: isNavActive('/settings/billing') ? 'primary.main' : '#64748B' }}>
                        <PaymentOutlinedIcon sx={{ fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText primary={t('nav.billing')} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isNavActive('/settings/billing') ? 700 : 500 }} />
                    </ListItemButton>
                  </ListItem>
                )}

                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    component={RouterLink}
                    to="/settings/profile"
                    onClick={() => setMobileOpen(false)}
                    selected={isNavActive('/settings/profile')}
                    sx={{ borderRadius: 2, py: 1 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: isNavActive('/settings/profile') ? 'primary.main' : '#64748B' }}>
                      <AccountCircleOutlinedIcon sx={{ fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText primary={user?.name || 'Profile & Firm'} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isNavActive('/settings/profile') ? 700 : 500 }} />
                  </ListItemButton>
                </ListItem>
              </>
            ) : (
              <>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton component={RouterLink} to="/" onClick={() => setMobileOpen(false)} sx={{ borderRadius: 2, py: 1 }}>
                    <ListItemText primary="Overview" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton component={RouterLink} to="/login" onClick={() => setMobileOpen(false)} sx={{ borderRadius: 2, py: 1 }}>
                    <ListItemText primary="Sign In" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton component={RouterLink} to="/register" onClick={() => setMobileOpen(false)} sx={{ borderRadius: 2, py: 1 }}>
                    <ListItemText primary="Register RIA" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600, color: 'primary.main' }} />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>
        </Box>

        <Box sx={{ pt: 2, borderTop: '1px solid #E2E8F0' }}>
          {!isGuest && (
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon sx={{ fontSize: 18 }} />}
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              sx={{ borderRadius: 2, mb: 1, py: 1, fontSize: '0.85rem' }}
            >
              Sign Out
            </Button>
          )}
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
