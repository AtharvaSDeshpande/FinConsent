import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CheckIcon from '@mui/icons-material/Check';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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

  const getRoleChipColor = () => {
    if (isGuest) return 'default';
    if (role === 'admin') return 'secondary';
    if (role === 'compliance_officer') return 'info';
    if (role === 'client') return 'success';
    return 'primary';
  };

  const getRoleChipLabel = () => {
    if (isGuest) return 'ROLE: GUEST';
    if (user?.plan === 'pro') return 'PRO RIA';
    return roleDef.shortLabel;
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
        {/* Left: Brand Logo & Navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <RouterLink
            to={isGuest ? '/' : '/dashboard'}
            style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}
          >
            <Logo size={32} />
          </RouterLink>

          {/* Authenticated Nav items tailored to role */}
          {!isGuest && (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              <Button
                component={RouterLink}
                to="/dashboard"
                startIcon={<DashboardOutlinedIcon />}
                color="inherit"
              >
                {role === 'client' ? 'My Authorizations' : role === 'compliance_officer' ? 'Audit Center' : 'Mandates Hub'}
              </Button>
              <Button
                component={RouterLink}
                to="/requests"
                startIcon={<AssignmentOutlinedIcon />}
                color="inherit"
              >
                {role === 'client' ? 'My Requests' : role === 'compliance_officer' ? 'Requests Scrutiny' : 'Requests Hub'}
              </Button>
              {(isRia || isAdmin || role === 'compliance_officer') && (
                <Button
                  component={RouterLink}
                  to="/clients"
                  startIcon={<PeopleAltOutlinedIcon />}
                  color="inherit"
                >
                  {role === 'compliance_officer' ? 'Audit Registry' : 'Clients'}
                </Button>
              )}
              {(isRia || isAdmin) && (
                <Button
                  component={RouterLink}
                  to="/settings/billing"
                  startIcon={<PaymentOutlinedIcon />}
                  color="inherit"
                >
                  Billing & Quota
                </Button>
              )}
            </Box>
          )}

          {/* Guest Nav items */}
          {isGuest && (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1.5 }}>
              <Button component={RouterLink} to="/legal/privacy" color="inherit" size="small">
                DPDP Privacy
              </Button>
              <Button component={RouterLink} to="/legal/terms" color="inherit" size="small">
                SEBI Terms
              </Button>
            </Box>
          )}
        </Box>

        {/* Right: Role Badge, Persona Switcher & Auth Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Active Role Badge */}
          <Chip
            label={getRoleChipLabel()}
            color={getRoleChipColor()}
            size="small"
            variant={user?.plan === 'pro' || role === 'admin' ? 'filled' : 'outlined'}
            sx={{ fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.03em' }}
          />

          {/* Quick Persona Switcher Dropdown */}
          <Button
            size="small"
            variant="outlined"
            onClick={handleOpenPersonaMenu}
            startIcon={<SwapHorizIcon />}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              px: 1.2,
              py: 0.4,
              fontSize: '0.78rem',
              fontWeight: 600,
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
                minWidth: 260,
                borderRadius: 2.5,
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              },
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                Established System Roles
              </Typography>
            </Box>
            <Divider />

            {personas.map((p) => {
              const isCurrent = (p.role === 'guest' && isGuest) || (!isGuest && user?.email === p.email);
              return (
                <MenuItem
                  key={p.label}
                  onClick={() => handleSelectPersona(p)}
                  selected={isCurrent}
                  sx={{ py: 1 }}
                >
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    {isCurrent ? <CheckIcon fontSize="small" color="primary" /> : <PersonOutlineIcon fontSize="small" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={isCurrent ? 700 : 500}>
                          {p.label}
                        </Typography>
                        <Chip label={p.badge} size="small" sx={{ fontSize: '0.65rem', height: 18 }} />
                      </Box>
                    }
                    secondary={p.description}
                    secondaryTypographyProps={{ variant: 'caption', noWrap: true, sx: { maxWidth: 220 } }}
                  />
                </MenuItem>
              );
            })}
          </Menu>

          {/* Authenticated user profile & sign out */}
          {!isGuest ? (
            <>
              <Button
                component={RouterLink}
                to="/settings/profile"
                startIcon={<AccountCircleOutlinedIcon />}
                size="small"
                color="inherit"
                sx={{ display: { xs: 'none', sm: 'inline-flex' }, fontWeight: 600 }}
              >
                {role === 'client' ? (user.name || 'Client Account') : role === 'compliance_officer' ? (user.name || 'Compliance Officer') : (user.sebiRegNumber || user.name || 'RIA Profile')}
              </Button>
              <IconButton onClick={handleLogout} color="inherit" title="Sign Out to Guest">
                <LogoutIcon fontSize="small" />
              </IconButton>
            </>
          ) : (
            <>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                size="small"
                startIcon={<LockOutlinedIcon />}
                sx={{ borderRadius: 2 }}
              >
                Sign In
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Register RIA
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
