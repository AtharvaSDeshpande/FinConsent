import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PhonelinkLockOutlinedIcon from '@mui/icons-material/PhonelinkLockOutlined';
import LinkOffOutlinedIcon from '@mui/icons-material/LinkOffOutlined';

export const AuditTrailTimeline = ({ logs = [] }) => {
  const getEventIcon = (type) => {
    switch (type) {
      case 'APPROVED':
        return <CheckCircleOutlineIcon color="success" />;
      case 'DISPATCHED':
        return <SendOutlinedIcon color="primary" />;
      case 'OPENED':
        return <VisibilityOutlinedIcon color="info" />;
      case 'OTP_SENT':
      case 'OTP_VERIFIED':
        return <PhonelinkLockOutlinedIcon color="warning" />;
      case 'LINK_REVOKED':
        return <LinkOffOutlinedIcon color="error" />;
      default:
        return <LockOutlinedIcon color="action" />;
    }
  };

  const getEventChip = (type) => {
    const colors = {
      APPROVED: 'success',
      DISPATCHED: 'primary',
      OPENED: 'info',
      OTP_SENT: 'warning',
      LINK_REVOKED: 'error',
      CREATED: 'default',
    };
    return (
      <Chip
        label={type}
        size="small"
        color={colors[type] || 'default'}
        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
      />
    );
  };

  return (
    <Card elevation={2} sx={{ borderRadius: 3, border: 1, borderColor: 'divider' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Immutable Regulatory Audit Trail
            </Typography>
            <Typography variant="caption" color="text.secondary">
              SEBI Regulation 19 & Section 65B IT Act Evidence Trail | SHA-256 Hash Chained
            </Typography>
          </Box>
          <Chip label="Append-Only / Locked" color="success" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
        </Box>

        {logs.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
            No audit records logged yet.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {logs.map((log, index) => (
              <Box
                key={log.id || index}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'background.default',
                  border: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {getEventIcon(log.eventType)}
                    <Typography variant="subtitle2" fontWeight={700}>
                      {log.eventType}
                    </Typography>
                    {getEventChip(log.eventType)}
                  </Box>
                  <Typography variant="caption" sx={{ fontFamily: 'JetBrains Mono', color: 'text.secondary' }}>
                    {new Date(log.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    IP Address: <strong>{log.ipAddress}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Client Device: <strong>{log.userAgent?.split(' ')[0] || 'Mobile'}</strong>
                  </Typography>
                  {log.otpVerificationId && (
                    <Typography variant="caption" color="text.secondary">
                      Verification Ref: <strong>{log.otpVerificationId}</strong>
                    </Typography>
                  )}
                </Box>

                {log.payloadHash && (
                  <Box sx={{ mt: 0.5, p: 1, bgcolor: 'background.paper', borderRadius: 1, border: '1px dashed rgba(148, 163, 184, 0.3)' }}>
                    <Typography variant="caption" sx={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: 'text.secondary', wordBreak: 'break-all' }}>
                      SHA-256 Digest: {log.payloadHash}
                    </Typography>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
