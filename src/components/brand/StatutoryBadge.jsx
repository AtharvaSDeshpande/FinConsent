import React from 'react';
import Chip from '@mui/material/Chip';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

export const StatutoryBadge = ({ status = 'APPROVED', size = 'small' }) => {
  const configs = {
    APPROVED: {
      label: 'SEBI Reg. 19 Verified',
      color: 'success',
      icon: <CheckCircleOutlineIcon fontSize="small" />,
    },
    IN_REVIEW: {
      label: 'Pending Client OTP',
      color: 'warning',
      icon: <WarningAmberOutlinedIcon fontSize="small" />,
    },
    DRAFT: {
      label: 'Advisory Draft',
      color: 'default',
      icon: <LockOutlinedIcon fontSize="small" />,
    },
    EXPIRED: {
      label: 'Cutoff Expired',
      color: 'error',
      icon: <WarningAmberOutlinedIcon fontSize="small" />,
    },
  };

  const current = configs[status.toUpperCase()] || configs.DRAFT;

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
