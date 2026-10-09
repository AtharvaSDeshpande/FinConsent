import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckIcon from '@mui/icons-material/Check';
import { WhatsAppShareButton } from './WhatsAppShareButton.jsx';
import { useI18n } from '../../i18n/I18nContext';

export const MagicLinkModal = ({ open, onClose, mandate, onRevokeAndRegenerate }) => {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [message, setMessage] = useState('');

  if (!mandate) return null;

  const magicUrl = mandate.magicToken
    ? `${window.location.origin}/m/${mandate.magicToken}`
    : '';

  const testPassword = mandate.password || mandate.clientPassword;

  React.useEffect(() => {
    if (open && mandate) {
      console.log('======================================================');
      console.log('>>> [DISPATCH MODAL - MANDATE & TESTING PASSWORD] <<<');
      console.log('Mandate ID:', mandate.id);
      console.log('Mandate Title:', mandate.title);
      console.log('Testing Password:', testPassword || 'N/A');
      console.log('Magic Link URL:', magicUrl || (mandate.magicToken ? `${window.location.origin}/m/${mandate.magicToken}` : 'N/A'));
      console.log('Mandate Data:', mandate);
      console.log('======================================================');
    }
  }, [open, mandate, testPassword, magicUrl]);

  const handleCopy = () => {
    if (!magicUrl) return;
    navigator.clipboard.writeText(magicUrl);
    setCopied(true);
    setMessage(t('magic_link.copy_success'));
    setTimeout(() => setCopied(false), 3000);
  };

  const handleRevoke = async () => {
    setRevoking(true);
    setMessage('');
    try {
      await onRevokeAndRegenerate(mandate.id);
      setMessage(t('magic_link.revoke_success'));
    } catch (err) {
      setMessage(t('magic_link.revoke_failed', { error: err.message }));
    } finally {
      setRevoking(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {t('magic_link.modal_title')}
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {t('magic_link.description')}
        </Typography>

        {testPassword && (
          <Alert severity="warning" sx={{ border: '1px dashed #ed6c02', bgcolor: '#fffbe6' }}>
            <Typography variant="caption" sx={{ fontWeight: 750, color: '#b76e00', display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t('magic_link.testing_password_badge')}
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 800, color: '#8c5000', mt: 0.5, letterSpacing: 1.5 }}>
              {testPassword}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {t('magic_link.format_helper', {
                pan: mandate.client?.pan ? String(mandate.client.pan).replace(/\D/g, '').slice(-4) : '****'
              })}
            </Typography>
          </Alert>
        )}

        {message && <Alert severity="info">{message}</Alert>}

        <TextField
          label={t('magic_link.token_url_label')}
          fullWidth
          value={magicUrl || t('magic_link.generating_link')}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  onClick={handleCopy}
                  size="small"
                  variant="contained"
                  disabled={!magicUrl}
                  startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                >
                  {copied ? t('magic_link.btn_copied') : t('magic_link.btn_copy')}
                </Button>
              </InputAdornment>
            ),
          }}
          sx={{ my: 1 }}
        />

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <WhatsAppShareButton
            mandate={mandate}
            magicUrl={magicUrl}
          />

          <Button
            variant="outlined"
            color="error"
            startIcon={<RefreshIcon />}
            onClick={handleRevoke}
            disabled={revoking}
          >
            {revoking ? t('magic_link.btn_revoking') : t('magic_link.btn_revoke')}
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {t('magic_link.forwarding_notice')}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>{t('common.close') || 'Close'}</Button>
      </DialogActions>
    </Dialog>
  );
};
