import React from 'react';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { calculateIndianGainsTax } from './taxCalculator.js';

export const TaxBreakdownCard = ({ stcgAmount = 0, ltcgAmount = 0, customTitle = 'Estimated Tax Liability (FY 2026-27)' }) => {
  const tax = calculateIndianGainsTax({ stcgAmount, ltcgAmount });

  return (
    <Card
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3.5,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptLongOutlinedIcon sx={{ fontSize: 20, color: '#0F172A' }} />
          <Typography variant="subtitle1" fontWeight={750} color="#0F172A">
            {customTitle}
          </Typography>
        </Box>
        <Box
          sx={{
            px: 1,
            py: 0.35,
            borderRadius: '6px',
            bgcolor: '#F1F5F9',
            color: '#475569',
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.03em',
          }}
        >
          Finance Act 2024
        </Box>
      </Box>

      {/* Tax Line Items */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2.5 }}>
        {/* STCG */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" fontWeight={650} color="#1E293B">
              Equity STCG (Section 111A @ 20%)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Realized profit: ₹{tax.stcg.toLocaleString('en-IN')}
            </Typography>
          </Box>
          <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'JetBrains Mono', color: '#0F172A' }}>
            ₹{tax.stcgTax.toLocaleString('en-IN')}
          </Typography>
        </Box>

        {/* LTCG */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" fontWeight={650} color="#1E293B">
              Equity LTCG (Section 112A @ 12.5%)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Realized: ₹{tax.ltcg.toLocaleString('en-IN')} (₹1.25L statutory exemption applied)
            </Typography>
          </Box>
          <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'JetBrains Mono', color: '#0F172A' }}>
            ₹{tax.ltcgTax.toLocaleString('en-IN')}
          </Typography>
        </Box>

        {/* Cess */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Health & Education Cess (4%)
          </Typography>
          <Typography variant="body2" fontWeight={650} sx={{ fontFamily: 'JetBrains Mono', color: '#475569' }}>
            ₹{tax.cess.toLocaleString('en-IN')}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2, borderColor: '#F1F5F9' }} />

      {/* Net Advisory Liability Callout */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: tax.totalTax > 0 ? 'rgba(217, 119, 6, 0.06)' : 'rgba(16, 185, 129, 0.06)',
          p: 2.2,
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: tax.totalTax > 0 ? 'rgba(217, 119, 6, 0.25)' : 'rgba(16, 185, 129, 0.25)',
        }}
      >
        <Box>
          <Typography
            variant="subtitle2"
            fontWeight={750}
            color={tax.totalTax > 0 ? '#92400E' : '#065F46'}
          >
            Net Pre-Computed Tax Obligation
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
            Mandatory disclosure prior to trade execution
          </Typography>
        </Box>
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{
            fontFamily: 'JetBrains Mono',
            color: tax.totalTax > 0 ? '#92400E' : '#065F46',
            letterSpacing: '-0.02em',
          }}
        >
          ₹{tax.totalTax.toLocaleString('en-IN')}
        </Typography>
      </Box>
    </Card>
  );
};

export default TaxBreakdownCard;
