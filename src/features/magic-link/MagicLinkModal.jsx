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
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CheckIcon from '@mui/icons-material/Check';
import { WhatsAppShareButton } from './WhatsAppShareButton.jsx';

export const MagicLinkModal = ({ open, onClose, mandate, onRevokeAndRegenerate }) => {
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [message, setMessage] = useState('');

  if (!mandate) return null;

  const magicUrl = `${window.location.origin}/m/${mandate.magicToken}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(magicUrl);
    setCopied(true);
    setMessage('Magic link copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleRevoke = async () => {
    setRevoking(true);
    setMessage('');
    try {
      await onRevokeAndRegenerate(mandate.id);
      setMessage('Prior link immediately invalidated. Fresh 256-bit token issued.');
    } catch (err) {
      setMessage(`Failed to revoke link: ${err.message}`);
    } finally {
      setRevoking(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        Dispatch Mandate Magic Link
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Clients access this proposal on mobile with zero account login. Legally binding trade authorization requires the 6-digit OTP sent to their verified phone number.
        </Typography>

        {message && <Alert severity="info">{message}</Alert>}

        <TextField
          label="256-bit Tokenized Magic URL"
          fullWidth
          value={magicUrl}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  onClick={handleCopy}
                  size="small"
                  variant="contained"
                  startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                >
                  {copied ? 'Copied' : 'Copy'}
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
            {revoking ? 'Revoking...' : 'Revoke & Regenerate Link'}
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          * Forwarding Protection: Revoking immediately expires the current token. If the client forwards the link, third parties cannot approve without the client's registered SMS OTP.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
