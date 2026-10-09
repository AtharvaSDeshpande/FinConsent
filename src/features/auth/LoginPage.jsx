import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Logo } from '../../components/brand/Logo.jsx';
import { useAuth } from '../../security/AuthContext.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

export const LoginPage = () => {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const [mfaRequired, setMfaRequired] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [mfaCode, setMfaCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
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

      if (data.mfaRequired) {
        setMfaRequired(true);
        setTempToken(data.tempToken);
        setError('');
        return;
      }

      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMfaVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, code: mfaCode.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid two-factor authentication code');
      }

      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
      {/* Back to Home Link */}
      <Box sx={{ mb: 2, textAlign: 'left' }}>
        <Button
          component={RouterLink}
          to="/"
          startIcon={<ArrowBackOutlinedIcon />}
          size="small"
          sx={{
            color: 'rgba(255, 255, 255, 0.75)',
            textTransform: 'none',
            fontSize: '0.85rem',
            '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255, 255, 255, 0.08)' },
          }}
        >
          Back to FinConsent Home
        </Button>
      </Box>

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
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
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
              {t('auth.sign_in_title')}
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
              {t('auth.sign_in_subtitle')}
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

          {/* Login Form or MFA Verification Form */}
          {mfaRequired ? (
            <Box component="form" onSubmit={handleMfaVerify} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: 2,
                }}
              >
                <Typography variant="subtitle2" sx={{ color: '#818CF8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShieldOutlinedIcon sx={{ fontSize: 18 }} /> Two-Factor Authentication Required
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 0.5, display: 'block' }}>
                  Enter the 6-digit TOTP code from your mobile authenticator app (Google Authenticator / 1Password) or an emergency recovery code.
                </Typography>
              </Box>

              <TextField
                id="mfa_code_input"
                label="6-Digit Verification Code"
                type="text"
                fullWidth
                required
                autoFocus
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.trim())}
                placeholder="123456"
                inputProps={{ maxLength: 10, style: { letterSpacing: 4, textAlign: 'center', fontSize: '1.25rem' } }}
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
                id="mfa_verify_btn"
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={submitting || !mfaCode}
                startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <LockOutlinedIcon />}
                sx={{
                  mt: 0.5,
                  py: 1.3,
                  fontSize: '0.98rem',
                  fontWeight: 700,
                  borderRadius: 2.5,
                  background: 'linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)',
                  boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.39)',
                }}
              >
                {submitting ? 'Verifying 2FA...' : 'Verify Code & Enter Workspace'}
              </Button>

              <Button
                variant="text"
                size="small"
                onClick={() => { setMfaRequired(false); setMfaCode(''); setError(''); }}
                sx={{ color: 'rgba(255, 255, 255, 0.6)', textTransform: 'none' }}
              >
                ← Back to password login
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                id="login_email_input"
                label={t('auth.email_label')}
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
                id="login_password_input"
                label={t('auth.password_label')}
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
                id="login_submit_btn"
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
                {submitting ? t('auth.signing_in') : t('auth.sign_in_button')}
              </Button>
            </Box>
          )}

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
