import React from 'react';
import Button from '@mui/material/Button';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

export const WhatsAppShareButton = ({ mandate, magicUrl }) => {
  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello, please review your statutory trade rebalance proposal "${mandate.title}".\n\n` +
      `Estimated Pre-computed Tax Impact: ₹${(mandate.taxPayable || 0).toLocaleString('en-IN')}\n\n` +
      `Review and authorize via secure magic link:\n${magicUrl}\n\n` +
      `SEBI Reg. 19 Non-Discretionary Mandate.`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <Button
      variant="contained"
      color="success"
      startIcon={<WhatsAppIcon />}
      onClick={handleWhatsApp}
    >
      Share via WhatsApp
    </Button>
  );
};
