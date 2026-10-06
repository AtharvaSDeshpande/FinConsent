import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';

export const NotificationTemplates = () => {
  const templates = [
    {
      name: 'Mandate Dispatched',
      channel: 'Email & In-App Portal',
      sample: 'Dear Client, your trade rebalance proposal is ready for review with pre-computed capital gains tax. Authorize at: finconsent.in/m/{token}',
    },
    {
      name: 'Statutory Verification OTP',
      channel: 'Email & In-App (SMS Disabled)',
      sample: 'FinConsent: Your statutory trade authorization OTP is {otp}. Valid for 5 minutes. (Dispatched via secure email; SMS channel decommissioned).',
    },
    {
      name: 'Mandate Approved & Dossier Issued',
      channel: 'Email & In-App Dossier',
      sample: 'Trade mandate successfully approved. Certified SEBI Regulation 19 Compliance Dossier attached.',
    },
  ];

  return (
    <Card elevation={2} sx={{ borderRadius: 3, border: 1, borderColor: 'divider' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Automated Statutory Notification Templates
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Dispatches via Resend Email and secure In-App portal (SMS notifications permanently disabled by policy)
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {templates.map((tpl, i) => (
            <Box key={i} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {tpl.name}
                </Typography>
                <Chip label={tpl.channel} size="small" variant="outlined" />
              </Box>
              <Typography variant="body2" sx={{ fontFamily: 'JetBrains Mono', fontSize: '0.82rem', color: 'text.secondary' }}>
                {tpl.sample}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};
