import React from 'react';
import Chip from '@mui/material/Chip';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';

export const StatutoryBadge = ({ status = 'DRAFT', size = 'small' }) => {
  const norm = (status || '').toUpperCase();

  const configs = {
    DRAFT: {
      label: 'Draft',
      color: 'default',
      icon: <LockOutlinedIcon fontSize="small" />,
    },
    SENT: {
      label: 'Sent',
      color: 'info',
      icon: <SendOutlinedIcon fontSize="small" />,
    },
    VIEWED: {
      label: 'Viewed',
      color: 'secondary',
      icon: <VisibilityOutlinedIcon fontSize="small" />,
    },
    IN_REVIEW: {
      label: 'Viewed',
      color: 'secondary',
      icon: <VisibilityOutlinedIcon fontSize="small" />,
    },
    CONSENTED: {
      label: 'Consented',
      color: 'success',
      icon: <CheckCircleOutlineIcon fontSize="small" />,
    },
    APPROVED: {
      label: 'Consented',
      color: 'success',
      icon: <CheckCircleOutlineIcon fontSize="small" />,
    },
    EXPIRED: {
      label: 'Expired',
      color: 'error',
      icon: <WarningAmberOutlinedIcon fontSize="small" />,
    },
  };

  const current = configs[norm] || configs.DRAFT;

  return (
    <Chip
      size={size}
      icon={current.icon}
      label={current.label}
      color={current.color}
      variant="outlined"
      sx={{ fontWeight: 600, fontSize: '0.75rem' }}
    />
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
      <Chip
        size="small"
        color="error"
        label="Expired"
        icon={<AccessTimeOutlinedIcon fontSize="small" />}
        sx={{ fontWeight: 600, fontSize: '0.72rem', ml: 1 }}
      />
    );
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <Chip
      size="small"
      color={diffHours < 12 ? 'warning' : 'default'}
      variant="filled"
      label={`${diffHours}h ${diffMinutes}m left (48h window)`}
      icon={<AccessTimeOutlinedIcon fontSize="small" />}
      sx={{ fontWeight: 600, fontSize: '0.72rem', ml: 1 }}
    />
  );
};
