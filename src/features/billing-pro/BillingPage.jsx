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
import { useI18n } from '../../i18n/I18nContext.jsx';

export const BillingPage = () => {
  const { user, updateUser } = useAuth();
  const { t } = useI18n();
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
        setMessage(t('billing.order_created', { orderId: res.data.orderId }));
      }
    } catch (err) {
      setMessage(t('billing.checkout_failed', { error: err.message }));
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
        setMessage(t('billing.upgrade_success'));
        fetchQuota();
      }
    } catch (err) {
      setMessage(t('billing.simulation_failed', { error: err.message }));
    } finally {
      setLoading(false);
    }
  };

  const isPro = user?.plan === 'pro';

  const proFeatures = [
    t('billing.feature_1'),
    t('billing.feature_2'),
    t('billing.feature_3'),
    t('billing.feature_4'),
    t('billing.feature_5'),
  ];

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700}>
          {t('billing.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {t('billing.subtitle')}
        </Typography>
      </Box>

      {message && <Alert severity="info" sx={{ mb: 3 }}>{message}</Alert>}

      <Grid container spacing={3}>
        {/* Quota Usage Meter */}
        <Grid item xs={12} md={5} size={{ xs: 12, md: 5 }}>
          <Card elevation={2} sx={{ borderRadius: 3, border: 1, borderColor: 'divider', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {t('billing.quota_heading')}
              </Typography>

              <Box sx={{ my: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('billing.active_proposals')}
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {quota.activeMandates} / {isPro ? t('billing.unlimited') : '3'}
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
                  ? t('billing.pro_quota_info')
                  : quota.activeMandates >= 3
                  ? t('billing.free_quota_limit')
                  : t('billing.free_quota_info', { count: 3 - quota.activeMandates })}
              </Alert>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {t('billing.quota_footnote')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Pro Plan Card */}
        <Grid item xs={12} md={7} size={{ xs: 12, md: 7 }}>
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
                label={t('billing.active_badge')}
                color="success"
                size="small"
                sx={{ position: 'absolute', top: 16, right: 16, fontWeight: 700 }}
              />
            )}
            <CardContent sx={{ p: 4 }}>
              <Typography variant="overline" fontWeight={700} color="secondary.main">
                {t('billing.recommended_badge')}
              </Typography>
              <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5 }}>
                {t('billing.pro_tier_name')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, my: 2 }}>
                <Typography variant="h4" fontWeight={800}>
                  ₹2,499
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('billing.price_period')}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, my: 3 }}>
                {proFeatures.map((feature, i) => (
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
                    {loading ? t('billing.btn_initializing_razorpay') : t('billing.btn_upgrade_razorpay')}
                  </Button>

                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleSimulatePayment}
                    disabled={loading}
                  >
                    {t('billing.btn_simulate_pro')}
                  </Button>
                </Box>
              ) : (
                <Alert severity="success" sx={{ mt: 2 }}>
                  {t('billing.pro_active_alert')}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BillingPage;
