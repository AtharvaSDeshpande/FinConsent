import React, { useState, useEffect } from 'react';
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
import CircularProgress from '@mui/material/CircularProgress';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Logo } from '../../components/brand/Logo.jsx';
import { useAuth } from '../../security/AuthContext.jsx';

const GoogleGIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: 10, flexShrink: 0 }}>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const DEMO_PERSONAS = [
  { role: 'guest', label: 'Guest (Public)', email: 'guest@finconsent.in', badge: 'Public' },
  { role: 'ria', label: 'RIA (Free)', email: 'ria@example.in', badge: 'Standard' },
  { role: 'ria', label: 'RIA (Pro)', email: 'pro.ria@example.in', badge: 'Pro' },
  { role: 'compliance_officer', label: 'Compliance Officer', email: 'compliance@example.in', badge: 'Auditor' },
  { role: 'admin', label: 'Platform Admin', email: 'admin@example.in', badge: 'Superuser' },
  { role: 'client', label: 'Advisory Client', email: 'client@example.in', badge: 'Investor' },
];

export const LoginPage = () => {
  const [email, setEmail] = useState('ria@example.in');
  const [password, setPassword] = useState('Password@123');
  const [selectedRole, setSelectedRole] = useState('ria');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [gisMounted, setGisMounted] = useState(false);
  const { login, loginWithGoogle, resetToGuest } = useAuth();
  const navigate = useNavigate();

  const handleGoogleCredentialResponse = async (response) => {
    setError('');
    setSubmitting(true);
    try {
      await loginWithGoogle({
        credential: response.credential,
        role: selectedRole,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const googleClientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      '449245026318-c7tdrllunjusqapt02qn2ugmbp2t0r80.apps.googleusercontent.com';

    const initGoogleGis = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
          });
          const btn = document.getElementById('g_id_signin_btn');
          if (btn) {
            btn.innerHTML = '';
            window.google.accounts.id.renderButton(btn, {
              theme: 'filled_blue',
              size: 'large',
              width: btn.offsetWidth || 380,
              text: 'continue_with',
              shape: 'pill',
            });
            setGisMounted(true);
          }
        } catch (e) {
          console.warn('[Google GIS init warning]:', e.message);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGoogleGis();
    } else {
      const timer = setTimeout(initGoogleGis, 600);
      return () => clearTimeout(timer);
    }
  }, [selectedRole]);

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

      const contentType = res.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        const cleanMsg = text.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim().slice(0, 150);
        throw new Error(cleanMsg || 'Server error occurred during login');
      }

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

  const handleDemoFill = (demoEmail, role = 'ria') => {
    if (role === 'guest') {
      resetToGuest();
      setSelectedRole('guest');
      setEmail('');
      setPassword('');
      return;
    }
    setEmail(demoEmail);
    setPassword('Password@123');
    setSelectedRole(role);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSubmitting(true);
    try {
      await loginWithGoogle({
        email: email || 'advisor.google@example.in',
        name: email ? email.split('@')[0] : 'Google Certified RIA',
        googleId: `google_uid_${Date.now()}`,
        role: selectedRole,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 460, mx: 'auto' }}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: '1px solid rgba(255, 255, 255, 0.12)',
          bgcolor: 'rgba(13, 27, 54, 0.95)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 35px rgba(99, 102, 241, 0.15)',
          color: '#F8FAFC',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4.5 } }}>
          {/* Header Brand */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3.5 }}>
            <Box
              sx={{
                p: 1.2,
                borderRadius: '50%',
                bgcolor: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                mb: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Logo size={38} />
            </Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
              FinConsent Workspace
            </Typography>
            <Typography
              variant="caption"
              sx={{
                mt: 0.8,
                color: 'rgba(255, 255, 255, 0.65)',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <ShieldOutlinedIcon sx={{ fontSize: 14, color: '#38BDF8' }} />
              SEBI Reg 19 • Statutory Advisory & Consent Management
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2.5,
                bgcolor: 'rgba(239, 68, 68, 0.15)',
                color: '#FCA5A5',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 2,
              }}
            >
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Registered Email"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="advisor@firm.in"
              size="medium"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(15, 23, 42, 0.6)',
                  borderRadius: 2.5,
                  color: '#FFFFFF',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.18)' },
                  '&:hover fieldset': { borderColor: 'rgba(99, 102, 241, 0.6)' },
                  '&.Mui-focused fieldset': { borderColor: '#6366F1' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.65)' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#818CF8' },
              }}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="medium"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(15, 23, 42, 0.6)',
                  borderRadius: 2.5,
                  color: '#FFFFFF',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.18)' },
                  '&:hover fieldset': { borderColor: 'rgba(99, 102, 241, 0.6)' },
                  '&.Mui-focused fieldset': { borderColor: '#6366F1' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.65)' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#818CF8' },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <LockOutlinedIcon />}
              sx={{
                mt: 0.5,
                py: 1.3,
                fontSize: '0.98rem',
                fontWeight: 700,
                borderRadius: 2.5,
                background: 'linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)',
                boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.39)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4338CA 0%, #1D4ED8 100%)',
                  boxShadow: '0 6px 20px rgba(79, 70, 229, 0.5)',
                },
              }}
            >
              {submitting ? 'Authenticating...' : 'Sign In to Workspace'}
            </Button>

            <Divider
              sx={{
                my: 1.5,
                '&::before, &::after': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                color: 'rgba(255, 255, 255, 0.45)',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
              }}
            >
              OR
            </Divider>

            {/* Unified Google OAuth action */}
            <Box
              id="g_id_signin_btn"
              sx={{
                display: gisMounted ? 'flex' : 'none',
                justifyContent: 'center',
                width: '100%',
                minHeight: 44,
              }}
            />

            {!gisMounted && (
              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={handleGoogleSignIn}
                disabled={submitting}
                sx={{
                  py: 1.2,
                  borderRadius: 2.5,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.35)',
                  },
                }}
              >
                <GoogleGIcon />
                Continue with Google OAuth
              </Button>
            )}
          </Box>

          {/* Persona quick switch */}
          <Box
            sx={{
              mt: 3.5,
              p: 2,
              bgcolor: 'rgba(15, 23, 42, 0.55)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 3,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                display: 'block',
                mb: 1.2,
                color: 'rgba(255, 255, 255, 0.6)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                fontSize: '0.7rem',
              }}
            >
              Demo Personas (Live Seeder Database):
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
              {DEMO_PERSONAS.map((p) => {
                const isSelected = email === p.email;
                return (
                  <Chip
                    key={p.email}
                    label={p.label}
                    size="small"
                    onClick={() => handleDemoFill(p.email, p.role)}
                    clickable
                    icon={isSelected ? <CheckCircleRoundedIcon sx={{ fontSize: '14px !important', color: '#10B981 !important' }} /> : undefined}
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
                      bgcolor: isSelected ? 'rgba(99, 102, 241, 0.35)' : 'rgba(255, 255, 255, 0.06)',
                      border: `1px solid ${isSelected ? '#818CF8' : 'rgba(255, 255, 255, 0.12)'}`,
                      '&:hover': {
                        bgcolor: isSelected ? 'rgba(99, 102, 241, 0.45)' : 'rgba(255, 255, 255, 0.12)',
                      },
                    }}
                  />
                );
              })}
            </Box>
          </Box>

          {/* Registration link */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.65)' }}>
              Don't have an RIA account?{' '}
              <Link
                component={RouterLink}
                to="/register"
                sx={{
                  color: '#60A5FA',
                  fontWeight: 700,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Register firm
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
