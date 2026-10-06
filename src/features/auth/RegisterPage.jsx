import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import Grid from '@mui/material/Grid';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Logo } from '../../components/brand/Logo.jsx';
import { useAuth } from '../../security/AuthContext.jsx';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    firmName: '',
    sebiRegNumber: '',
    complianceEmail: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // SEBI Registration format validation: INA followed by 9 digits
    const sebiRegex = /^INA\d{9}$/i;
    if (!sebiRegex.test(formData.sebiRegNumber.trim())) {
      setError('Invalid SEBI Registration Number. Must be in format INAXXXXXXXXX (e.g. INA000088921)');
      return;
    }

    if (!agreeTerms) {
      setError('You must accept the terms of service and statutory compliance mandate');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const contentType = res.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        const cleanMsg = text.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim().slice(0, 150);
        throw new Error(cleanMsg || 'Server error occurred during registration');
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyles = {
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
    '& .MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.45)' },
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 620, mx: 'auto' }}>
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
              Register RIA Practice
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
              Onboard your Investment Advisory practice to FinConsent
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

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Full Name (Principal Officer)"
                name="name"
                required
                fullWidth
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Suresh Narayanan"
                sx={inputStyles}
              />

              <TextField
                label="Advisory Entity / Firm Name"
                name="firmName"
                required
                fullWidth
                value={formData.firmName}
                onChange={handleChange}
                placeholder="e.g. Prudent Wealth Advisory"
                sx={inputStyles}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="SEBI Reg Number"
                name="sebiRegNumber"
                required
                fullWidth
                value={formData.sebiRegNumber}
                onChange={handleChange}
                placeholder="INA000088921"
                helperText="Format: INA followed by 9 digits"
                inputProps={{ style: { textTransform: 'uppercase' } }}
                sx={inputStyles}
              />

              <TextField
                label="Work Email"
                name="email"
                type="email"
                required
                fullWidth
                value={formData.email}
                onChange={handleChange}
                placeholder="suresh@prudentwealth.in"
                sx={inputStyles}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Statutory Compliance Email"
                name="complianceEmail"
                type="email"
                required
                fullWidth
                value={formData.complianceEmail}
                onChange={handleChange}
                placeholder="compliance@firm.in"
                helperText="Receives quarterly audit dossiers"
                sx={inputStyles}
              />

              <TextField
                label="Master Password"
                name="password"
                type="password"
                required
                fullWidth
                value={formData.password}
                onChange={handleChange}
                helperText="Min 8 characters with numbers"
                sx={inputStyles}
              />
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.4)',
                    '&.Mui-checked': { color: '#6366F1' },
                  }}
                />
              }
              label={
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  I confirm this advisory practice operates strictly under a non-discretionary mandate per SEBI (IA)
                  Regulations, 2013 and agree to the{' '}
                  <Link
                    component={RouterLink}
                    to="/legal/terms"
                    target="_blank"
                    sx={{ color: '#60A5FA', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    component={RouterLink}
                    to="/legal/privacy"
                    target="_blank"
                    sx={{ color: '#60A5FA', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    DPDP Privacy Policy
                  </Link>
                  .
                </Typography>
              }
              sx={{ alignItems: 'flex-start', mt: 1 }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <HowToRegOutlinedIcon />}
              sx={{
                mt: 1,
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
              {submitting ? 'Registering RIA Account...' : 'Complete RIA Registration'}
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.65)' }}>
              Already registered?{' '}
              <Link
                component={RouterLink}
                to="/login"
                sx={{
                  color: '#60A5FA',
                  fontWeight: 700,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Sign In
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterPage;
