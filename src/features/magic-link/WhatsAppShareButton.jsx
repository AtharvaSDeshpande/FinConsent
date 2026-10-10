import React from 'react';
import Button from '@mui/material/Button';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useI18n } from '../../i18n/I18nContext';

export const WhatsAppShareButton = ({ mandate, magicUrl }) => {
  const { t, formatCurrency } = useI18n();

  const handleWhatsApp = () => {
    if (!magicUrl || !mandate) return;
    try {
      const formattedTax = formatCurrency(mandate?.taxPayable || 0);
      const msg = t('magic_link.whatsapp_msg_template', {
        title: mandate?.title || 'Mandate',
        tax: formattedTax,
        url: magicUrl,
      });
      const text = encodeURIComponent(msg);
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    } catch (err) {
      console.warn('[WhatsApp Share Error]:', err);
    }
  };

  return (
    <Button
      variant="contained"
      color="success"
      startIcon={<WhatsAppIcon />}
      onClick={handleWhatsApp}
      disabled={!magicUrl || !mandate}
    >
      {t('magic_link.whatsapp_btn')}
    </Button>
  );
};

export default WhatsAppShareButton;
