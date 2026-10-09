import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useI18n } from '../../i18n/I18nContext.jsx';

export const StatutoryBadge = ({ status = 'DRAFT', size = 'small' }) => {
  const { t } = useI18n();
  const norm = (status || '').toUpperCase();
  const lowerKey = (status || '').toLowerCase();

  const configs = {
    DRAFT: {
      label: 'Draft Mandate',
      bg: 'rgba(241, 245, 249, 0.8)',
      color: '#475569',
      border: 'rgba(203, 213, 225, 0.8)',
      icon: <EditOutlinedIcon sx={{ fontSize: 13, color: '#64748B' }} />,
    },
    SENT: {
      label: 'Link Dispatched',
      bg: 'rgba(254, 243, 199, 0.6)',
      color: '#92400E',
      border: 'rgba(245, 158, 11, 0.35)',
      icon: <SendOutlinedIcon sx={{ fontSize: 13, color: '#D97706' }} />,
    },
    VIEWED: {
      label: 'Client Reviewing',
      bg: 'rgba(238, 242, 255, 0.8)',
      color: '#3730A3',
      border: 'rgba(99, 102, 241, 0.35)',
      icon: <VisibilityOutlinedIcon sx={{ fontSize: 13, color: '#4F46E5' }} />,
    },
    IN_REVIEW: {
      label: 'Client Reviewing',
      bg: 'rgba(238, 242, 255, 0.8)',
      color: '#3730A3',
      border: 'rgba(99, 102, 241, 0.35)',
      icon: <VisibilityOutlinedIcon sx={{ fontSize: 13, color: '#4F46E5' }} />,
    },
    CONSENTED: {
      label: 'Statutory Consented',
      bg: 'rgba(236, 253, 245, 0.8)',
      color: '#065F46',
      border: 'rgba(16, 185, 129, 0.35)',
      icon: <CheckCircleRoundedIcon sx={{ fontSize: 13, color: '#059669' }} />,
    },
    APPROVED: {
      label: 'Statutory Consented',
      bg: 'rgba(236, 253, 245, 0.8)',
      color: '#065F46',
      border: 'rgba(16, 185, 129, 0.35)',
      icon: <CheckCircleRoundedIcon sx={{ fontSize: 13, color: '#059669' }} />,
    },
    EXPIRED: {
      label: 'Cutoff Expired',
      bg: 'rgba(254, 242, 242, 0.8)',
      color: '#991B1B',
      border: 'rgba(239, 68, 68, 0.35)',
      icon: <WarningAmberRoundedIcon sx={{ fontSize: 13, color: '#DC2626' }} />,
    },
  };

  const current = configs[norm] || configs.DRAFT;
  const localizedLabel = t(`status.${lowerKey}`) || current.label;

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.7,
        px: size === 'small' ? 1 : 1.4,
        py: size === 'small' ? 0.35 : 0.6,
        borderRadius: '6px',
        bgcolor: current.bg,
        border: '1px solid',
        borderColor: current.border,
        color: current.color,
        fontWeight: 650,
        fontSize: size === 'small' ? '0.73rem' : '0.8rem',
        letterSpacing: '0.01em',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {current.icon}
      <span>{localizedLabel}</span>
    </Box>
  );
};

export const ExpirationCountdownBadge = ({ cutoffTimestamp, status }) => {
  if (!cutoffTimestamp || status === 'consented' || status === 'approved') {
    return null;
  }

  const cutoff = new Date(cutoffTimestamp).getTime();
  const now = Date.now();
  const diffMs = cutoff - now;

  if (diffMs <= 0 || status === 'expired') {
    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          px: 0.9,
          py: 0.35,
          borderRadius: '6px',
          bgcolor: 'rgba(254, 242, 242, 0.8)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#991B1B',
          fontWeight: 650,
          fontSize: '0.7rem',
          ml: 0.75,
        }}
      >
        <AccessTimeOutlinedIcon sx={{ fontSize: 12, color: '#DC2626' }} />
        <span>Cutoff Passed</span>
      </Box>
    );
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const isUrgent = diffHours < 12;

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 0.9,
        py: 0.35,
        borderRadius: '6px',
        bgcolor: isUrgent ? 'rgba(254, 243, 199, 0.8)' : 'rgba(241, 245, 249, 0.8)',
        border: '1px solid',
        borderColor: isUrgent ? 'rgba(245, 158, 11, 0.4)' : 'rgba(203, 213, 225, 0.7)',
        color: isUrgent ? '#92400E' : '#475569',
        fontWeight: 650,
        fontSize: '0.7rem',
        ml: 0.75,
        whiteSpace: 'nowrap',
      }}
    >
      <AccessTimeOutlinedIcon sx={{ fontSize: 12, color: isUrgent ? '#D97706' : '#64748B' }} />
      <span>{`${diffHours}h ${diffMinutes}m left`}</span>
    </Box>
  );
};
