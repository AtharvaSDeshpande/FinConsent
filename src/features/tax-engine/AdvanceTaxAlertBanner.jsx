import React from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';

export const AdvanceTaxAlertBanner = ({ installment = '4th Installment - Due 15th March', totalTax = 0 }) => {
  if (!totalTax || totalTax <= 0) return null;

  return (
    <Alert
      severity="warning"
      icon={<EventBusyOutlinedIcon fontSize="inherit" />}
      sx={{ borderRadius: 2, border: 1, borderColor: 'warning.light', my: 2 }}
    >
      <AlertTitle sx={{ fontWeight: 700 }}>
        Advance Tax Alert: {installment}
      </AlertTitle>
      <Typography variant="body2">
        To prevent mandatory penal interest of 1% per month under Section 234B & Section 234C of the Income Tax Act, ensure ₹{totalTax.toLocaleString('en-IN')} is factored into the upcoming quarterly Advance Tax deposit.
      </Typography>
    </Alert>
  );
};
