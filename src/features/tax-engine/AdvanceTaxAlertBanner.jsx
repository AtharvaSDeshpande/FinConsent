import React from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import { useI18n } from '../../i18n/I18nContext';

export const AdvanceTaxAlertBanner = ({
  installment = '4th Installment - Due 15th March',
  totalTax = 0,
  netGain = 0,
}) => {
  const { t, formatCurrency } = useI18n();
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
        {t('tax.advance_tax_title', { installment })}
      </AlertTitle>
      <Typography variant="body2">
        {t('tax.advance_tax_desc', {
          installment,
          tax: formatCurrency(Number(totalTax)),
        })}
      </Typography>
    </Alert>
  );
};

export default AdvanceTaxAlertBanner;
