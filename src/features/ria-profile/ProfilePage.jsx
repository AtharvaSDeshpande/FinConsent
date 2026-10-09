import React, { useState, useEffect } from 'react';
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
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../../security/AuthContext.jsx';
import { useI18n } from '../../i18n/index.js';

export const ProfilePage = () => {
  const { user, role, roleDef, isRia, isAdmin, updateUser } = useAuth();
  const { language, setLanguage, t, supportedLanguages, currentLanguageInfo } = useI18n();

  const [name, setName] = useState(user?.name || '');
  const [firmName, setFirmName] = useState(user?.firmName || '');
  const [sebiRegNumber, setSebiRegNumber] = useState(user?.sebiRegNumber || '');
  const [complianceEmail, setComplianceEmail] = useState(user?.complianceEmail || '');
  const [mobile, setMobile] = useState(user?.mobile || '+91 98765 43210');
  const [pan, setPan] = useState(user?.pan || 'ABCDE1234F');
  const [selectedLanguage, setSelectedLanguage] = useState(user?.preferredLanguage || language);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Sync selected language when user preferredLanguage loads or updates
  useEffect(() => {
    if (user?.preferredLanguage && user.preferredLanguage !== selectedLanguage) {
      setSelectedLanguage(user.preferredLanguage);
      setLanguage(user.preferredLanguage);
    }
  }, [user?.preferredLanguage]);

  const handleLanguageSelect = (newLang) => {
    setSelectedLanguage(newLang);
    setLanguage(newLang);
  };

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
        preferredLanguage: selectedLanguage,
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
      setLanguage(selectedLanguage);
      setSuccess(t('profile.save_success'));
    } catch (err) {
      setError(err.message || t('profile.save_error'));
    } finally {
      setSaving(false);
    }
  };

  const getPageTitle = () => {
    if (role === 'client') return t('profile.title_client');
    if (role === 'compliance_officer') return t('profile.title_compliance');
    return t('profile.title_ria');
  };

  const getPageSubtitle = () => {
    if (role === 'client') return t('profile.subtitle_client');
    if (role === 'compliance_officer') return t('profile.subtitle_compliance');
    return t('profile.subtitle_ria');
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
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
        {/* Left Column: Language Card & Identity Form */}
        <Grid item xs={12} md={8} size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            {/* 1. Language & Localization Card */}
            <Card elevation={2} sx={{ borderRadius: 3, border: 1, borderColor: 'primary.light', bgcolor: '#F8FAFC' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TranslateOutlinedIcon color="primary" />
                    <Typography variant="h6" fontWeight={700} color="#0F172A">
                      {t('profile.section_language')}
                    </Typography>
                  </Box>
                  <Chip
                    icon={<CheckCircleIcon sx={{ fontSize: '16px !important' }} />}
                    label={`${currentLanguageInfo.flag} ${currentLanguageInfo.nativeName} (${currentLanguageInfo.name})`}
                    color="primary"
                    variant="outlined"
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
                  {t('profile.language_description')}
                </Typography>

                <FormControl fullWidth size="small" sx={{ mb: 2, bgcolor: '#FFFFFF', borderRadius: 1 }}>
                  <InputLabel id="language-select-label">{t('profile.language_select_label')}</InputLabel>
                  <Select
                    labelId="language-select-label"
                    id="profile_language_select"
                    value={selectedLanguage}
                    label={t('profile.language_select_label')}
                    onChange={(e) => handleLanguageSelect(e.target.value)}
                  >
                    {supportedLanguages.map((lang) => (
                      <MenuItem key={lang.code} value={lang.code} id={`profile_lang_option_${lang.code}`}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <span style={{ fontSize: '1.2rem' }}>{lang.flag}</span>
                          <Typography variant="body2" fontWeight={600}>
                            {lang.nativeName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            — {lang.name}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Quick Selection Language Chips */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {supportedLanguages.map((lang) => (
                    <Chip
                      key={lang.code}
                      id={`lang_chip_${lang.code}`}
                      label={`${lang.flag} ${lang.nativeName}`}
                      onClick={() => handleLanguageSelect(lang.code)}
                      color={selectedLanguage === lang.code ? 'primary' : 'default'}
                      variant={selectedLanguage === lang.code ? 'filled' : 'outlined'}
                      size="small"
                      sx={{
                        cursor: 'pointer',
                        fontWeight: selectedLanguage === lang.code ? 700 : 500,
                        transition: 'all 0.15s ease-in-out',
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* 2. Statutory Credentials & Identity Form */}
            <Card elevation={2} sx={{ borderRadius: 3, border: 1, borderColor: 'divider' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                  {role === 'client'
                    ? t('profile.section_identity_client')
                    : role === 'compliance_officer'
                    ? t('profile.section_identity_compliance')
                    : t('profile.section_identity_ria')}
                </Typography>

                <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    id="profile_name_input"
                    label={t('profile.full_name')}
                    fullWidth
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />

                  {(isRia || isAdmin) && (
                    <>
                      <TextField
                        id="profile_firm_name_input"
                        label={t('profile.firm_name')}
                        fullWidth
                        required
                        value={firmName}
                        onChange={(e) => setFirmName(e.target.value)}
                      />

                      <TextField
                        id="profile_sebi_number_input"
                        label={t('profile.sebi_reg_number')}
                        fullWidth
                        required
                        value={sebiRegNumber}
                        onChange={(e) => setSebiRegNumber(e.target.value)}
                        helperText={t('profile.sebi_helper')}
                        inputProps={{ style: { textTransform: 'uppercase' } }}
                      />
                    </>
                  )}

                  {role === 'client' && (
                    <>
                      <TextField
                        id="profile_pan_input"
                        label={t('profile.pan_label')}
                        fullWidth
                        value={pan}
                        onChange={(e) => setPan(e.target.value)}
                        helperText={t('profile.pan_helper')}
                        inputProps={{ style: { textTransform: 'uppercase' } }}
                      />
                      <TextField
                        id="profile_mobile_input"
                        label={t('profile.mobile_label')}
                        fullWidth
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        helperText={t('profile.mobile_helper')}
                      />
                    </>
                  )}

                  <TextField
                    id="profile_email_input"
                    label={role === 'client' ? t('profile.email_label_client') : t('profile.email_label_ria')}
                    type="email"
                    fullWidth
                    value={complianceEmail}
                    onChange={(e) => setComplianceEmail(e.target.value)}
                    helperText={role === 'client' ? t('profile.email_helper_client') : t('profile.email_helper_ria')}
                  />

                  <Button
                    id="profile_save_btn"
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    startIcon={<SaveOutlinedIcon />}
                    sx={{ alignSelf: 'flex-start', mt: 1, px: 3, py: 1, borderRadius: 2 }}
                  >
                    {saving ? t('profile.saving_button') : t('profile.save_button')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Right Column: Statutory Status Summary */}
        <Grid item xs={12} md={4} size={{ xs: 12, md: 4 }}>
          <Card elevation={2} sx={{ borderRadius: 3, border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                {role === 'client' ? (
                  <SecurityOutlinedIcon color="success" />
                ) : (
                  <VerifiedUserOutlinedIcon color="success" />
                )}
                <Typography variant="subtitle1" fontWeight={700}>
                  {role === 'client' ? t('profile.protection_status') : t('profile.licensing_status')}
                </Typography>
              </Box>

              <Chip
                label={roleDef.label}
                color={role === 'client' ? 'success' : role === 'compliance_officer' ? 'info' : 'primary'}
                variant="outlined"
                size="small"
                sx={{ fontWeight: 600, mb: 2 }}
              />

              <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6 }}>
                {role === 'client'
                  ? t('profile.disclaimer_client')
                  : role === 'compliance_officer'
                  ? t('profile.disclaimer_compliance')
                  : t('profile.disclaimer_ria')}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Dynamic user information strictly preserved in English */}
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {t('profile.account_user')}: <strong style={{ color: '#0F172A' }}>{user?.name}</strong>
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.8 }}>
                {t('profile.login_email')}: <strong style={{ color: '#0F172A' }}>{user?.email}</strong>
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.8 }}>
                {t('profile.assigned_role')}: <strong style={{ color: '#0F172A' }}>{roleDef.name}</strong>
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.8 }}>
                {t('profile.current_language')}: <strong style={{ color: '#0F172A' }}>{currentLanguageInfo.nativeName} ({currentLanguageInfo.name})</strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage;
