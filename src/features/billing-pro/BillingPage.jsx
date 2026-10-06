import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import { useAuth } from '../../security/AuthContext.jsx';
import { createRazorpayCheckout, upgradeTestPlan } from '../../integrations/razorpay.js';

export const BillingPage = () => {
  const { user, updateUser } = useAuth();
  const [quota, setQuota] = useState({ activeMandates: 0, quotaLimit: 3, canCreate: true });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [checkoutData, setCheckoutData] = useState(null);

  const fetchQuota = async () => {
    try {
      const token = localStorage.getItem('finconsent_token');
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setQuota(data.quota);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQuota();
  }, []);

  const handleRazorpayUpgrade = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await createRazorpayCheckout();
      if (res.success) {
        setCheckoutData(res.data);
        setMessage(`Razorpay Order created: ${res.data.orderId}. Click 'Complete Payment' to finalize.`);
      }
    } catch (err) {
      setMessage(`Checkout creation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    setLoading(true);
    try {
      const res = await upgradeTestPlan();
      if (res.success) {
        updateUser({ plan: 'pro' });
        setMessage('Subscription successfully upgraded to Pro RIA tier! Mandate quota is now unlimited.');
        fetchQuota();
      }
    } catch (err) {
      setMessage(`Payment simulation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isPro = user?.plan === 'pro';

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700}>
          Subscription Plans & Quota Meter
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Tiered B2B SaaS pricing and statutory mandate quota controls
        </Typography>
      </Box>

      {message && <Alert severity="info" sx={{ mb: 3 }}>{message}</Alert>}

      <Grid container spacing={3}>
        {/* Quota Usage Meter */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={2} sx={{ borderRadius: 3, border: 1, borderColor: 'divider', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Active Mandate Quota
              </Typography>

              <Box sx={{ my: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Active Proposals
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {quota.activeMandates} / {isPro ? 'Unlimited' : '3'}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={isPro ? 20 : (quota.activeMandates / 3) * 100}
                  color={!isPro && quota.activeMandates >= 3 ? 'error' : 'primary'}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>

              <Alert severity={isPro ? 'success' : quota.activeMandates >= 3 ? 'error' : 'info'} sx={{ mb: 2 }}>
                {isPro
                  ? 'Pro Plan: You have unlimited mandate creation.'
                  : quota.activeMandates >= 3
                  ? 'Free tier quota limit reached (3 active mandates). Upgrade to create new mandates.'
                  : `${3 - quota.activeMandates} free active mandate slot(s) remaining.`}
              </Alert>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                * Completed or approved mandates are preserved in audit history and do not consume active quota once archived.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Pro Plan Card */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card
            elevation={3}
            sx={{
              borderRadius: 3,
              border: 2,
              borderColor: isPro ? 'success.main' : 'primary.main',
              position: 'relative',
            }}
          >
            {isPro && (
              <Chip
                label="ACTIVE SUBSCRIPTION"
                color="success"
                size="small"
                sx={{ position: 'absolute', top: 16, right: 16, fontWeight: 700 }}
              />
            )}
            <CardContent sx={{ p: 4 }}>
              <Typography variant="overline" fontWeight={700} color="secondary.main">
                RECOMMENDED FOR SEBI RIAS
              </Typography>
              <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5 }}>
                Pro RIA Annual / Monthly
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, my: 2 }}>
                <Typography variant="h4" fontWeight={800}>
                  ₹2,499
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  / month (+ 18% GST)
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, my: 3 }}>
                {[
                  'Unlimited active trade rebalancing mandates',
                  'Up to 150 active HNI advisory clients',
                  'White-labeled client portal with firm logo & INA number',
                  'TRAI DLT-compliant SMS OTP verification',
                  'Statutory 5-year AWS Mumbai cloud audit retention',
                ].map((feature, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon color="success" fontSize="small" />
                    <Typography variant="body2">{feature}</Typography>
                  </Box>
                ))}
              </Box>

              {!isPro ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PaymentOutlinedIcon />}
                    onClick={handleRazorpayUpgrade}
                    disabled={loading}
                  >
                    {loading ? 'Initializing Razorpay...' : 'Upgrade with Razorpay (₹2,949)'}
                  </Button>

                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleSimulatePayment}
                    disabled={loading}
                  >
                    Simulate Pro Upgrade (Demo / Sandbox)
                  </Button>
                </Box>
              ) : (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Your firm is enrolled in Pro RIA. Subscription renwal managed via Razorpay.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};
