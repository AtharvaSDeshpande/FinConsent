import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useI18n } from '../../i18n/I18nContext.jsx';

export const OtpModal = ({ open, onClose, token, mandate, maskedMobile, unlockToken, onVerified }) => {
  const { t } = useI18n();
  const [otp, setOtp] = useState('');
  const [agreeGains, setAgreeGains] = useState(false);
  const [agreeConsent, setAgreeConsent] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoOtpHint, setDemoOtpHint] = useState('');

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleRequestOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (unlockToken) headers['x-unlock-token'] = unlockToken;
      const res = await fetch(`/api/public/mandates/${token}/request-otp`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ unlockToken }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch OTP');
      }

      setOtpSent(true);
      setResendTimer(30);
      if (data.demoOtp) {
        setDemoOtpHint(data.demoOtp);
        setOtp(data.demoOtp); // Autofill demo OTP for seamless evaluation
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    if (!agreeGains || !agreeConsent) {
      setError('You must check both declarations before submitting authorization.');
      return;
    }

    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the 6-digit demo verification OTP displayed below.');
      return;
    }

    setLoading(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (unlockToken) headers['x-unlock-token'] = unlockToken;
      const res = await fetch(`/api/public/mandates/${token}/verify-otp`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          otp: otp.trim(),
          statutoryDeclarationsAccepted: true,
          unlockToken,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Verification failed');
      }

      onVerified(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        {t('otp.dialog_title')}
      </DialogTitle>
      <Box component="form" onSubmit={handleVerify}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t('otp.mandate_label')} <strong>{mandate?.title}</strong>
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          {/* Statutory Declarations */}
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              {t('otp.declarations_heading')}
            </Typography>

            <FormControlLabel
              control={
                <Checkbox
                  id="agree_gains_checkbox"
                  checked={agreeGains}
                  onChange={(e) => setAgreeGains(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  {t('otp.agree_gains', { tax: (mandate?.taxPayable || 0).toLocaleString('en-IN') })}
                </Typography>
              }
              sx={{ alignItems: 'flex-start', mb: 1 }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  id="agree_consent_checkbox"
                  checked={agreeConsent}
                  onChange={(e) => setAgreeConsent(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  {t('otp.agree_consent')}
                </Typography>
              }
              sx={{ alignItems: 'flex-start' }}
            />
          </Box>

          {!otpSent ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Alert severity="info" sx={{ mb: 2, textAlign: 'left', fontSize: '0.82rem' }}>
                {t('otp.sms_disabled_alert')}
              </Alert>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('otp.click_generate_desc')}
              </Typography>
              <Button
                id="generate_otp_btn"
                variant="contained"
                onClick={handleRequestOtp}
                disabled={loading || !agreeGains || !agreeConsent}
                startIcon={<LockOutlinedIcon />}
              >
                {loading ? t('common.loading') : t('otp.generate_otp_button')}
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                id="otp_input_field"
                label={t('otp.enter_otp_label')}
                required
                fullWidth
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                inputProps={{
                  maxLength: 6,
                  style: {
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    letterSpacing: '0.4em',
                    fontFamily: 'JetBrains Mono',
                  },
                }}
                helperText={`${t('otp.otp_helper_text')}${demoOtpHint ? ` (Instant OTP: ${demoOtpHint})` : ''}`}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  size="small"
                  onClick={handleRequestOtp}
                  disabled={resendTimer > 0 || loading}
                >
                  {resendTimer > 0 ? t('otp.resend_timer_label', { sec: resendTimer }) : t('otp.resend_otp')}
                </Button>
                <Typography variant="caption" color="text.secondary">
                  {t('otp.otp_validity_note')}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} disabled={loading}>
            {t('common.cancel')}
          </Button>
          {otpSent && (
            <Button
              id="confirm_authorization_btn"
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !agreeGains || !agreeConsent}
            >
              {loading ? t('otp.authorizing') : t('otp.confirm_button')}
            </Button>
          )}
        </DialogActions>
      </Box>
    </Dialog>
  );
};
