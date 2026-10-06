import React from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';

export const AdvanceTaxAlertBanner = ({
  installment = '4th Installment - Due 15th March',
  totalTax = 0,
  netGain = 0,
}) => {
  // Triggers when net capital gain exceeds ₹1,00,000 OR total pre-computed tax > 0 (Criterion 2)
  const isTriggered = Number(totalTax) > 0 || Number(netGain) > 100000;
  if (!isTriggered) return null;

  return (
    <Alert
      severity="warning"
      icon={<EventBusyOutlinedIcon fontSize="inherit" />}
      sx={{
        borderRadius: 2,
        border: 1,
        borderColor: 'warning.light',
        my: 2,
        '& .MuiAlert-message': { width: '100%' },
      }}
    >
      <AlertTitle sx={{ fontWeight: 700 }}>
        Advance Tax Alert: {installment}
      </AlertTitle>
      <Typography variant="body2">
        Net capital gains exceed ₹1,00,000 threshold. Under Section 234B & Section 234C of the Income Tax Act, ensure statutory tax obligations (est. ₹{Number(totalTax).toLocaleString('en-IN')}) are deposited before the {installment} quarterly deadline to avoid penal interest.
      </Typography>
    </Alert>
  );
};
