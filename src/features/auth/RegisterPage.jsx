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
      setError('Invalid SEBI Registration Number. Must be in format INAXXXXXXXXX (e.g., INA000088921)');
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
      const data = await res.json();

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

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', mt: { xs: 3, md: 6 }, px: 2 }}>
      <Card elevation={3} sx={{ borderRadius: 3, border: 1, borderColor: 'divider' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Logo size={40} />
            <Typography variant="h5" component="h1" sx={{ mt: 2, fontWeight: 700 }}>
              RIA Registration
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 0.5 }}>
              Onboard your Investment Advisory practice to FinConsent
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Full Name (Principal Officer / RIA)"
              name="name"
              required
              fullWidth
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Suresh Narayanan"
            />

            <TextField
              label="Advisory Entity / Firm Name"
              name="firmName"
              required
              fullWidth
              value={formData.firmName}
              onChange={handleChange}
              placeholder="e.g. Prudent Wealth Advisory"
            />

            <TextField
              label="SEBI Registration Number (INAXXXXXXXXX)"
              name="sebiRegNumber"
              required
              fullWidth
              value={formData.sebiRegNumber}
              onChange={handleChange}
              placeholder="INA000088921"
              helperText="12 characters starting with INA followed by 9 digits"
              inputProps={{ style: { textTransform: 'uppercase' } }}
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
            />

            <TextField
              label="Statutory Compliance Email"
              name="complianceEmail"
              type="email"
              fullWidth
              value={formData.complianceEmail}
              onChange={handleChange}
              placeholder="compliance@prudentwealth.in"
              helperText="Receives quarterly audit dossiers and inspection copies"
            />

            <TextField
              label="Password"
              name="password"
              type="password"
              required
              fullWidth
              value={formData.password}
              onChange={handleChange}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="caption" color="text.secondary">
                  I confirm this advisory practice operates strictly under a non-discretionary mandate per SEBI (IA) Regulations, 2013 and agree to the{' '}
                  <Link component={RouterLink} to="/legal/terms" target="_blank">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link component={RouterLink} to="/legal/privacy" target="_blank">
                    DPDP Privacy Policy
                  </Link>.
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
              sx={{ mt: 1 }}
            >
              {submitting ? 'Registering RIA Account...' : 'Complete Registration'}
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already registered?{' '}
              <Link component={RouterLink} to="/login" fontWeight={600}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
