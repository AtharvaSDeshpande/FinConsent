import React from 'react';
import { Navigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import ShieldAlertIcon from '@mui/icons-material/GppBadOutlined';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user.role || 'ria';
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: 1, borderColor: 'error.light' }}>
          <ShieldAlertIcon color="error" sx={{ fontSize: 56, mb: 2 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Access Restricted by Role (RBAC)
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Your active role is <strong>{userRole.toUpperCase()}</strong>. Access to this page requires one of the following authorized roles:
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
            {allowedRoles.map((role) => (
              <Box
                key={role}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  borderRadius: 1,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                {role.toUpperCase()}
              </Box>
            ))}
          </Box>
          <Button variant="contained" component={RouterLink} to="/dashboard">
            Return to Dashboard
          </Button>
        </Card>
      </Container>
    );
  }

  return children;
};
