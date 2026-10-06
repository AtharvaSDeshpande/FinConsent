import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import GoogleIcon from '@mui/icons-material/Google';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Logo } from '../../components/brand/Logo.jsx';
import { useAuth } from '../../security/AuthContext.jsx';

export const LoginPage = () => {
  const [email, setEmail] = useState('ria@prudentwealth.in');
  const [password, setPassword] = useState('Password@123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password@123');
  };

  const handleGoogleMock = () => {
    handleDemoFill('compliance@apexfo.com');
  };

  return (
    <Box sx={{ maxWidth: 460, mx: 'auto', mt: { xs: 4, md: 8 }, px: 2 }}>
      <Card elevation={3} sx={{ borderRadius: 3, border: 1, borderColor: 'divider' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Logo size={40} />
            <Typography variant="h5" component="h1" sx={{ mt: 2, fontWeight: 700 }}>
              RIA Workspace Sign In
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 0.5 }}>
              SEBI Regulation 19 Advisory Consent Platform
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Registered Email"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="advisor@firm.in"
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={submitting}
              startIcon={<LockOutlinedIcon />}
              sx={{ mt: 1 }}
            >
              {submitting ? 'Authenticating...' : 'Sign In to Workspace'}
            </Button>

            <Divider sx={{ my: 1 }}>OR</Divider>

            <Button
              variant="outlined"
              fullWidth
              startIcon={<GoogleIcon />}
              onClick={handleGoogleMock}
              sx={{ borderColor: 'divider', color: 'text.primary' }}
            >
              Sign In with Google Workspace
            </Button>
          </Box>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1, color: 'text.secondary' }}>
              Quick Demo Accounts:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label="Prudent Wealth (Free)"
                size="small"
                onClick={() => handleDemoFill('ria@prudentwealth.in')}
                clickable
                color="primary"
                variant="outlined"
              />
              <Chip
                label="Apex MFO (Pro)"
                size="small"
                onClick={() => handleDemoFill('compliance@apexfo.com')}
                clickable
                color="secondary"
                variant="outlined"
              />
            </Box>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an RIA account?{' '}
              <Link component={RouterLink} to="/register" fontWeight={600}>
                Register firm
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
