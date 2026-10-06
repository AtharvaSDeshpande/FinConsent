import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';

export const RefundPolicyPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Card elevation={2} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, border: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <CurrencyRupeeOutlinedIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1" fontWeight={800}>
            Refund & Cancellation Policy
          </Typography>
        </Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Payment Gateway Standards for B2B SaaS Subscriptions (Razorpay Compliance)
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              1. B2B Subscription Cancellations
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Subscribers to the FinConsent Pro RIA plan (₹2,499/month + GST or ₹24,990/year + GST) may cancel their recurring subscription at any time via the billing settings dashboard. Upon cancellation, access to Pro features will remain active until the end of the current billing cycle.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              2. 7-Day Pilot Refund Window
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              If you upgrade to Pro RIA and determine within seven (7) business days of initial activation that the platform does not satisfy your firm's compliance requirements, you may contact <code>support@finconsent.in</code> to request a full 100% refund.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              3. Processing of Refunds
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Approved refunds are credited directly back to the original source account (UPI, credit/debit card, net banking) via Razorpay within 5–7 business days, in compliance with standard Reserve Bank of India (RBI) payment clearing guidelines.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              4. Contact Support
            </Typography>
            <Typography variant="body2" color="text.secondary">
              For billing inquiries or refund requests, email: <code>support@finconsent.in</code>
            </Typography>
          </Box>
        </Box>
      </Card>
    </Container>
  );
};
