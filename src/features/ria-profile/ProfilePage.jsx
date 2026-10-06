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
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { useAuth } from '../../security/AuthContext.jsx';

export const ProfilePage = () => {
  const { user, role, roleDef, isRia, isAdmin, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [firmName, setFirmName] = useState(user?.firmName || '');
  const [sebiRegNumber, setSebiRegNumber] = useState(user?.sebiRegNumber || '');
  const [complianceEmail, setComplianceEmail] = useState(user?.complianceEmail || '');
  const [mobile, setMobile] = useState(user?.mobile || '+91 98765 43210');
  const [pan, setPan] = useState(user?.pan || 'ABCDE1234F');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isRia || isAdmin) {
      const sebiRegex = /^INA\d{9}$/i;
      if (sebiRegNumber && !sebiRegex.test(sebiRegNumber.trim())) {
        setError('Invalid SEBI Registration Number. Must be in format INAXXXXXXXXX (e.g. INA000088921)');
        return;
      }
    }

    setSaving(true);
    const token = localStorage.getItem('finconsent_token');

    try {
      const payload = {
        name,
        complianceEmail,
      };

      if (isRia || isAdmin) {
        payload.firmName = firmName;
        if (sebiRegNumber) payload.sebiRegNumber = sebiRegNumber.toUpperCase();
      } else if (role === 'client') {
        payload.mobile = mobile;
        payload.pan = pan.toUpperCase();
      }

      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update profile');
      }

      updateUser(data.user);
      setSuccess('Profile and statutory credentials updated successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const getPageTitle = () => {
    if (role === 'client') return 'Client Profile & Investor Record';
    if (role === 'compliance_officer') return 'Compliance Officer Credentials & Audit Routing';
    return 'RIA Credentials & Advisory Profile';
  };

  const getPageSubtitle = () => {
    if (role === 'client') {
      return 'Personal identification and statutory consumer protections under SEBI Regulations & DPDP Act, 2023';
    }
    if (role === 'compliance_officer') {
      return 'Statutory audit oversight credentials and regulatory surveillance configuration';
    }
    return 'Statutory licensing and compliance identification under SEBI (Investment Advisers) Regulations, 2013';
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700}>
          {getPageTitle()}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {getPageSubtitle()}
        </Typography>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card elevation={2} sx={{ borderRadius: 3, border: 1, borderColor: 'divider' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                {role === 'client'
                  ? 'Investor Identity Information'
                  : role === 'compliance_officer'
                  ? 'Official Compliance Officer Details'
                  : 'Advisory Firm Registration'}
              </Typography>

              <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label="Full Name"
                  fullWidth
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                {(isRia || isAdmin) && (
                  <>
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
                  </>
                )}

                {role === 'client' && (
                  <>
                    <TextField
                      label="Permanent Account Number (PAN)"
                      fullWidth
                      value={pan}
                      onChange={(e) => setPan(e.target.value)}
                      helperText="Required for Section 65B Indian Evidence Act identification"
                      inputProps={{ style: { textTransform: 'uppercase' } }}
                    />
                    <TextField
                      label="Registered Mobile Number"
                      fullWidth
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      helperText="Designated destination for statutory OTP authentication challenges"
                    />
                  </>
                )}

                <TextField
                  label={role === 'client' ? 'Registered Email Address' : 'Statutory Compliance / Official Email'}
                  type="email"
                  fullWidth
                  value={complianceEmail}
                  onChange={(e) => setComplianceEmail(e.target.value)}
                  helperText={
                    role === 'client'
                      ? 'Destination for rebalancing disclosures and Regulation 19 certificates'
                      : 'Destination inbox for automated Regulation 19 audit certificates'
                  }
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

        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={2} sx={{ borderRadius: 3, border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                {role === 'client' ? (
                  <SecurityOutlinedIcon color="success" />
                ) : (
                  <VerifiedUserOutlinedIcon color="success" />
                )}
                <Typography variant="subtitle1" fontWeight={700}>
                  {role === 'client' ? 'Protection Status' : 'Licensing Status'}
                </Typography>
              </Box>

              <Chip
                label={roleDef.label}
                color={role === 'client' ? 'success' : role === 'compliance_officer' ? 'info' : 'primary'}
                variant="outlined"
                size="small"
                sx={{ fontWeight: 600, mb: 2 }}
              />

              <Typography variant="body2" color="text.secondary" paragraph>
                {role === 'client'
                  ? 'Your account is safeguarded by SEBI Regulation 19 non-discretionary consent rules and the Digital Personal Data Protection Act, 2023.'
                  : role === 'compliance_officer'
                  ? 'Authorized supervisory officer with immutable read-only access to statutory audit trails, mandate logs, and Regulation 19 dossiers.'
                  : 'All client rebalancing mandates dispatched from this account will carry your statutory INA license number in the cryptographic header.'}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Account User: <strong>{user?.name}</strong>
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                Login Email: <strong>{user?.email}</strong>
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                Assigned Role: <strong>{roleDef.name}</strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage;
