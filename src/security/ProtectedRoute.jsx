import React from 'react';
import { useLocation, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import ShieldAlertIcon from '@mui/icons-material/GppBadOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, role, isGuest, switchPersona, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Guest Role Handling
  if (isGuest || role === 'guest') {
    const recommendedRole = allowedRoles[0] || 'ria';
    const targetPersonaEmail =
      recommendedRole === 'compliance_officer'
        ? 'compliance@example.in'
        : recommendedRole === 'admin'
        ? 'admin@example.in'
        : recommendedRole === 'client'
        ? 'client@example.in'
        : 'ria@example.in';

    const handleOneClickTestDrive = async () => {
      try {
        await switchPersona(targetPersonaEmail);
        navigate(location.pathname);
      } catch (err) {
        navigate('/login', { state: { from: location } });
      }
    };

    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 4,
            border: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'rgba(99, 102, 241, 0.12)',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 32 }} />
          </Box>

          <Typography variant="h5" fontWeight={800} gutterBottom>
            Role Authentication Required
          </Typography>

          <Typography variant="body2" component="div" color="text.secondary" sx={{ mb: 2.5 }}>
            You are currently exploring FinConsent as a{' '}
            <Chip label="GUEST VISITOR" size="small" color="default" sx={{ fontWeight: 700, mx: 0.5 }} />.
            This workflow requires an established authenticated role.
          </Typography>

          {allowedRoles.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 700, color: 'text.secondary' }}>
                PERMITTED ROLES FOR THIS SCREEN:
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                {allowedRoles.map((r) => (
                  <Chip
                    key={r}
                    label={r.toUpperCase()}
                    size="small"
                    color={r === 'admin' ? 'secondary' : r === 'compliance_officer' ? 'info' : 'primary'}
                    sx={{ fontWeight: 700 }}
                  />
                ))}
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 3 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleOneClickTestDrive}
              endIcon={<ArrowForwardIcon />}
              sx={{
                py: 1.3,
                fontWeight: 700,
                borderRadius: 2.5,
                bgcolor: '#0F172A',
                color: '#FFFFFF',
                '&:hover': { bgcolor: '#1E293B' },
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
              }}
            >
              1-Click Test Drive as {recommendedRole.replace('_', ' ').toUpperCase()}
            </Button>

            <Button
              variant="outlined"
              size="large"
              component={RouterLink}
              to="/login"
              state={{ from: location }}
              startIcon={<PersonOutlineIcon />}
              sx={{ borderRadius: 2.5, fontWeight: 600, borderColor: '#CBD5E1', color: '#0F172A' }}
            >
              Sign In with Existing Account
            </Button>
          </Box>
        </Card>
      </Container>
    );
  }

  // Authenticated Role Access Check (Strict RBAC & Private Data Guard)
  const userRole = user?.role || role;
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole) && userRole !== 'admin') {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card
          elevation={0}
          sx={{
            p: 4.5,
            textAlign: 'center',
            borderRadius: 3.5,
            border: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: '#F1F5F9',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h5" fontWeight={800} color="#0F172A" gutterBottom>
            Access Restricted
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6, maxWidth: 440, mx: 'auto', mb: 3 }}>
            You do not have permission to view or manage this section under your active profile.
            To safeguard investor privacy and regulatory compliance, this workspace is restricted to authorized roles.
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to="/dashboard"
            sx={{
              fontWeight: 700,
              borderRadius: 2.5,
              px: 3.5,
              py: 1.2,
              bgcolor: '#0F172A',
              color: '#FFFFFF',
              '&:hover': { bgcolor: '#1E293B' },
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
            }}
          >
            Return to My Workspace
          </Button>
        </Card>
      </Container>
    );
  }

  return children;
};

export default ProtectedRoute;
