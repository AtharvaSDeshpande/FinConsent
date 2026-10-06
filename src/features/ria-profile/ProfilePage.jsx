import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { useAuth } from '../../security/AuthContext.jsx';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [firmName, setFirmName] = useState(user?.firmName || '');
  const [sebiRegNumber, setSebiRegNumber] = useState(user?.sebiRegNumber || '');
  const [complianceEmail, setComplianceEmail] = useState(user?.complianceEmail || '');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const sebiRegex = /^INA\d{9}$/i;
    if (!sebiRegex.test(sebiRegNumber.trim())) {
      setError('Invalid SEBI Registration Number. Must be in format INAXXXXXXXXX (e.g. INA000088921)');
      return;
    }

    setSaving(true);
    const token = localStorage.getItem('finconsent_token');

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firmName,
          sebiRegNumber: sebiRegNumber.toUpperCase(),
          complianceEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update profile');
      }

      updateUser(data.user);
      setSuccess('RIA Profile and SEBI Registration details updated successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700}>
          RIA Credentials & Profile
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Statutory licensing and compliance identification under SEBI (Investment Advisers) Regulations, 2013
        </Typography>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ borderRadius: 3, border: 1, borderColor: 'divider' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                Advisory Firm Registration
              </Typography>

              <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label="Registered Advisory Firm Name"
                  fullWidth
                  required
                  value={firmName}
                  onChange={(e) => setFirmName(e.target.value)}
                />

                <TextField
                  label="SEBI Registration Number (INAXXXXXXXXX)"
                  fullWidth
                  required
                  value={sebiRegNumber}
                  onChange={(e) => setSebiRegNumber(e.target.value)}
                  helperText="Format: INA followed by 9 digits (e.g., INA000088921)"
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                />

                <TextField
                  label="Statutory Compliance Email"
                  type="email"
                  fullWidth
                  value={complianceEmail}
                  onChange={(e) => setComplianceEmail(e.target.value)}
                  helperText="Destination inbox for automated Regulation 19 audit certificates"
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                  startIcon={<SaveOutlinedIcon />}
                  sx={{ alignSelf: 'flex-start', mt: 1 }}
                >
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ borderRadius: 3, border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <VerifiedUserOutlinedIcon color="success" />
                <Typography variant="subtitle1" fontWeight={700}>
                  Licensing Status
                </Typography>
              </Box>

              <Chip
                label="SEBI Active Registration"
                color="success"
                variant="outlined"
                size="small"
                sx={{ fontWeight: 600, mb: 2 }}
              />

              <Typography variant="body2" color="text.secondary" paragraph>
                All client rebalancing mandates dispatched from this account will carry your statutory INA license number in the cryptographic header.
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Account Owner: <strong>{user?.name}</strong>
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                Login Email: <strong>{user?.email}</strong>
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                Current Plan: <strong>{user?.plan === 'pro' ? 'Pro RIA Tier' : 'Free Sandbox'}</strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};
