import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { calculateIndianGainsTax } from './taxCalculator.js';

export const TaxBreakdownCard = ({ stcgAmount = 0, ltcgAmount = 0, customTitle = 'Estimated Tax Liability (FY 2026-27)' }) => {
  const tax = calculateIndianGainsTax({ stcgAmount, ltcgAmount });

  return (
    <Card elevation={2} sx={{ borderRadius: 3, border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReceiptLongOutlinedIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={700}>
              {customTitle}
            </Typography>
          </Box>
          <Chip label="Finance Act 2024" size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, my: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                Equity STCG (Section 111A @ 20%)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Realized gain: ₹{tax.stcg.toLocaleString('en-IN')}
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'JetBrains Mono' }}>
              ₹{tax.stcgTax.toLocaleString('en-IN')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                Equity LTCG (Section 112A @ 12.5%)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Realized: ₹{tax.ltcg.toLocaleString('en-IN')} (Exemption ₹1.25 Lakh applied)
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'JetBrains Mono' }}>
              ₹{tax.ltcgTax.toLocaleString('en-IN')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Health & Education Cess (4%)
            </Typography>
            <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'JetBrains Mono' }}>
              ₹{tax.cess.toLocaleString('en-IN')}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'rgba(217, 119, 6, 0.08)', p: 2, borderRadius: 2 }}>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} color="warning.dark">
              Net Tax Obligation
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Pre-computed advisory liability
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight={800} sx={{ fontFamily: 'JetBrains Mono', color: 'warning.dark' }}>
            ₹{tax.totalTax.toLocaleString('en-IN')}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
