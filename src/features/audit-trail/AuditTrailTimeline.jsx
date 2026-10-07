import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PhonelinkLockOutlinedIcon from '@mui/icons-material/PhonelinkLockOutlined';
import LinkOffOutlinedIcon from '@mui/icons-material/LinkOffOutlined';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useAuth } from '../../security/AuthContext.jsx';

const EVENT_DESCRIPTIONS = {
  CREATED: 'Mandate draft prepared with pre-computed capital gains tax & allocation targets.',
  DISPATCHED: 'Secure proposal link dispatched to investor’s registered mobile via tokenized rail.',
  OPENED: 'Investor accessed the mobile proposal review portal.',
  OTP_SENT: '6-digit One-Time Password challenge dispatched to investor mobile.',
  OTP_VERIFIED: 'Investor verified identity with 6-digit OTP per SEBI Regulation 19 standards.',
  APPROVED: 'Investor formally accepted statutory mandate terms and authorized trade rebalancing.',
  LINK_REVOKED: 'Statutory link invalidated by RIA to prevent out-of-order execution.',
};

export const AuditTrailTimeline = ({ logs = [] }) => {
  const { isComplianceOfficer, isAdmin } = useAuth();
  // Compliance officers & admins see cryptographic hashes by default; others see friendly lifecycle log
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(isComplianceOfficer || isAdmin);

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
      OTP_VERIFIED: 'warning',
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Statutory Activity & Consent Log
            </Typography>
            <Typography variant="caption" color="text.secondary">
              SEBI Regulation 19 & Section 65B Indian Evidence Act compliant append-only trail
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              color={showTechnicalDetails ? 'primary' : 'inherit'}
              startIcon={<FingerprintIcon />}
              endIcon={showTechnicalDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              sx={{ textTransform: 'none', fontSize: '0.75rem', borderRadius: 2 }}
            >
              {showTechnicalDetails ? 'Hide Section 65B Hashes' : 'Show Section 65B Hashes'}
            </Button>
            <Chip label="Append-Only / Locked" color="success" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
          </Box>
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

                {/* Plain-English summary of what took place */}
                <Typography variant="body2" color="text.primary" sx={{ fontSize: '0.85rem', color: '#334155' }}>
                  {EVENT_DESCRIPTIONS[log.eventType] || `Lifecycle event ${log.eventType} recorded successfully.`}
                </Typography>

                {/* Human-friendly metadata */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Client Device: <strong>{log.userAgent?.split(' ')[0] || 'Mobile Device'}</strong>
                  </Typography>
                  {log.otpVerificationId && (
                    <Typography variant="caption" color="text.secondary">
                      Verification Ref: <strong>{log.otpVerificationId}</strong>
                    </Typography>
                  )}
                </Box>

                {/* Collapsible Technical / Cryptographic Section 65B Details */}
                <Collapse in={showTechnicalDetails}>
                  <Box
                    sx={{
                      mt: 1,
                      p: 1.5,
                      bgcolor: '#F8FAFC',
                      borderRadius: 1.5,
                      border: '1px dashed #CBD5E1',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.72rem' }}>
                      SECTION 65B FORENSIC RECORD:
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#64748B' }}>
                      IP Origin: <strong>{log.ipAddress || '127.0.0.1'}</strong> | User Agent: {log.userAgent || 'FinConsent-App/v2'}
                    </Typography>
                    {log.payloadHash && (
                      <Typography variant="caption" sx={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#0284C7', wordBreak: 'break-all' }}>
                        SHA-256 Digest: {log.payloadHash}
                      </Typography>
                    )}
                  </Box>
                </Collapse>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
