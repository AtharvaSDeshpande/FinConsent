import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { Link as RouterLink } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';

export const GuestDashboard = () => {
  const { t, formatCurrency } = useI18n();

  // Interactive tax preview state
  const [gainAmount, setGainAmount] = useState(150000);
  const [holdingMonths, setHoldingMonths] = useState(14);

  // Simple Finance Act 2024 calculation for preview
  const isLtcg = holdingMonths >= 12;
  const exemptionLimit = 125000; // FY24-25 limit
  const taxableGain = isLtcg ? Math.max(0, gainAmount - exemptionLimit) : gainAmount;
  const taxRate = isLtcg ? 0.125 : 0.20;
  const baseTax = Math.round(taxableGain * taxRate);
  const cess = Math.round(baseTax * 0.04);
  const totalEstimatedTax = baseTax + cess;

  const personas = [
    {
      id: 'ria',
      title: 'Registered Investment Adviser (RIA)',
      name: 'Suresh Narayanan',
      email: 'suresh@narayananwealth.in',
      desc: 'Draft non-discretionary rebalance mandates, compute tax liability, and monitor 48h client response windows.',
      icon: <BusinessCenterOutlinedIcon sx={{ fontSize: 24, color: '#1D4ED8' }} />,
      badge: 'INA000012345',
      badgeColor: '#EFF6FF',
      badgeTextColor: '#1D4ED8',
      cta: 'Test Drive as Adviser',
    },
    {
      id: 'client',
      title: 'Advisory Investor / Client',
      name: 'Rohan Mehta',
      email: 'rohan.mehta@example.in',
      desc: 'Review proposed portfolio allocations, understand tax impact, and approve with mobile OTP.',
      icon: <PersonOutlineIcon sx={{ fontSize: 24, color: '#047857' }} />,
      badge: 'PAN: ABCDE1234F',
      badgeColor: '#ECFDF5',
      badgeTextColor: '#047857',
      cta: 'Test Drive as Investor',
    },
    {
      id: 'compliance',
      title: 'Chief Compliance Officer',
      name: 'Priya Sharma',
      email: 'compliance@narayananwealth.in',
      desc: 'Inspect tamper-evident SHA-256 hash chains, verify OTP timestamps, and export Section 65B certificates.',
      icon: <FactCheckOutlinedIcon sx={{ fontSize: 24, color: '#7C3AED' }} />,
      badge: 'Surveillance Mode',
      badgeColor: '#F5F3FF',
      badgeTextColor: '#7C3AED',
      cta: 'Test Drive as Compliance',
    },
    {
      id: 'admin',
      title: 'Platform Administrator',
      name: 'Vikram Malhotra',
      email: 'admin@finconsent.internal',
      desc: 'Configure wealth advisory practices, manage institutional users, and monitor platform health.',
      icon: <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 24, color: '#D97706' }} />,
      badge: 'Superuser',
      badgeColor: '#FFFBEB',
      badgeTextColor: '#B45309',
      cta: 'Test Drive as Admin',
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      {/* 1. Welcoming Institutional Header */}
      <Box sx={{ mb: 5, textAlign: 'center', maxWidth: 840, mx: 'auto' }}>
        <Chip
          icon={<ShieldOutlinedIcon sx={{ fontSize: '15px !important', color: '#047857' }} />}
          label={t('guest.badge')}
          sx={{
            mb: 2,
            fontWeight: 700,
            fontSize: '0.8rem',
            bgcolor: '#ECFDF5',
            color: '#047857',
            border: '1px solid #A7F3D0',
          }}
        />
        <Typography variant="h3" component="h1" fontWeight={800} letterSpacing="-0.03em" color="#0F172A" sx={{ mb: 2 }}>
          {t('guest.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
          {t('guest.sub')}
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
          <Button
            variant="contained"
            component={RouterLink}
            to="/login"
            size="large"
            sx={{ fontWeight: 700, borderRadius: 2.5, bgcolor: '#0F172A', px: 3, '&:hover': { bgcolor: '#1E293B' } }}
          >
            {t('guest.btn_signin_workspace')}
          </Button>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/register"
            size="large"
            sx={{ fontWeight: 650, borderRadius: 2.5, borderColor: '#CBD5E1', color: '#334155', px: 3 }}
          >
            {t('guest.btn_register_practice')}
          </Button>
        </Stack>
      </Box>

      {/* 2. Supported Institutional Roles & Workspaces */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="h5" fontWeight={800} color="#0F172A">
            {t('guest.roles_title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('guest.roles_sub')}
          </Typography>
        </Box>

        <Grid container spacing={2.5}>
          {personas.map((p) => (
            <Grid key={p.id} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3.5,
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 24px -10px rgba(15, 23, 42, 0.08)',
                    borderColor: '#CBD5E1',
                  },
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      {p.icon}
                    </Box>
                    <Chip
                      label={p.badge}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        bgcolor: p.badgeColor,
                        color: p.badgeTextColor,
                      }}
                    />
                  </Box>
                  <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                    {p.title}
                  </Typography>
                  <Typography variant="caption" fontWeight={600} color="#475569" sx={{ display: 'block', mb: 1 }}>
                    {p.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem', mb: 2 }}>
                    {p.desc}
                  </Typography>
                </Box>

                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  fullWidth
                  endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    fontWeight: 700,
                    borderRadius: 2,
                    textTransform: 'none',
                    borderColor: '#CBD5E1',
                    color: '#0F172A',
                    '&:hover': { bgcolor: '#F8FAFC', borderColor: '#0F172A' },
                  }}
                >
                  {t('guest.btn_signin_access')}
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 3. Statutory Platform Architecture Highlights */}
      <Grid container spacing={3.5} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: 3.5,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              height: '100%',
            }}
          >
            <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 1 }}>
              {t('landing.journey_title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('landing.journey_sub')}
            </Typography>

            <Stack spacing={2.5}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#0F172A', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>
                  1
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                    {t('landing.step1_title')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('landing.step1_desc')}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#0F172A', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>
                  2
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                    {t('landing.step2_title')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('landing.step2_desc')}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#0F172A', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>
                  3
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                    {t('landing.step3_title')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('landing.step3_desc')}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#0F172A', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>
                  4
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                    {t('landing.step4_title')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('landing.step4_desc')}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#0F172A', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>
                  5
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                    {t('landing.step5_title')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('landing.step5_desc')}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Live Tax Calculator Simulator */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: 3.5,
              bgcolor: '#0F172A',
              color: '#FFFFFF',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CalculateOutlinedIcon sx={{ color: '#38BDF8' }} />
                <Typography variant="h6" fontWeight={800}>
                  {t('guest.simulator_title')}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
                {t('guest.simulator_sub')}
              </Typography>

              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#CBD5E1', display: 'block', mb: 0.5, fontWeight: 600 }}>
                    {t('guest.est_gain_label')}
                  </Typography>
                  <TextField
                    type="number"
                    size="small"
                    fullWidth
                    value={gainAmount}
                    onChange={(e) => setGainAmount(Number(e.target.value) || 0)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><CurrencyRupeeIcon sx={{ fontSize: 16, color: '#94A3B8' }} /></InputAdornment>,
                      sx: { color: '#FFF', bgcolor: '#1E293B', borderRadius: 2 },
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: '#CBD5E1', display: 'block', mb: 0.5, fontWeight: 600 }}>
                    {t('guest.holding_period_label')}
                  </Typography>
                  <TextField
                    type="number"
                    size="small"
                    fullWidth
                    value={holdingMonths}
                    onChange={(e) => setHoldingMonths(Number(e.target.value) || 0)}
                    InputProps={{
                      sx: { color: '#FFF', bgcolor: '#1E293B', borderRadius: 2 },
                    }}
                  />
                </Box>

                <Box sx={{ p: 2, bgcolor: '#1E293B', borderRadius: 2.5, border: '1px solid #334155' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>{t('guest.asset_class_label')}</Typography>
                    <Chip
                      label={isLtcg ? 'LTCG (≥ 12 Months)' : 'STCG (< 12 Months)'}
                      size="small"
                      sx={{ height: 20, fontSize: '0.68rem', bgcolor: isLtcg ? '#065F46' : '#92400E', color: '#FFF', fontWeight: 700 }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>{t('guest.tax_rate_label')}</Typography>
                    <Typography variant="caption" sx={{ color: '#FFF', fontWeight: 700 }}>
                      {isLtcg ? '12.5% (above ₹1.25L)' : '20.0%'}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1, borderColor: '#334155' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#E2E8F0', fontWeight: 700 }}>
                      {t('guest.total_tax_label')}
                    </Typography>
                    <Typography variant="h6" fontWeight={800} sx={{ color: '#38BDF8', fontFamily: 'JetBrains Mono' }}>
                      {formatCurrency(totalEstimatedTax)}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Box>

            <Button
              variant="contained"
              component={RouterLink}
              to="/login"
              fullWidth
              sx={{
                mt: 3,
                fontWeight: 700,
                borderRadius: 2,
                bgcolor: '#38BDF8',
                color: '#0F172A',
                '&:hover': { bgcolor: '#7DD3FC' },
              }}
            >
              {t('guest.btn_draft_tax_engine')}
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default GuestDashboard;
