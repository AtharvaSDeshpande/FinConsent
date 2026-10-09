import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Logo } from '../../components/brand/Logo.jsx';
import { useAuth } from '../../security/AuthContext.jsx';
import { useI18n } from '../../i18n/I18nContext';

export const LandingPage = () => {
  const { isAuthenticated, isGuest } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleQuickTestDrive = (email) => {
    navigate('/login', { state: { email } });
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box sx={{ width: '100%', overflowX: 'hidden' }}>
      {/* HERO SECTION */}
      <Box
        sx={{
          pt: { xs: 6, md: 10 },
          pb: { xs: 8, md: 12 },
          px: { xs: 2, sm: 4 },
          background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF2F6 100%)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <Container maxWidth="lg">
          {/* Statutory Verification Pill */}
          <Chip
            icon={<ShieldOutlinedIcon sx={{ fontSize: '16px !important', color: '#0369A1' }} />}
            label={t('landing.statutory_pill')}
            sx={{
              mb: 3,
              fontWeight: 700,
              fontSize: { xs: '0.72rem', sm: '0.82rem' },
              bgcolor: 'rgba(2, 132, 199, 0.1)',
              color: '#0369A1',
              border: '1px solid rgba(2, 132, 199, 0.25)',
              py: 0.5,
              px: 1,
            }}
          />

          {/* Main Headline */}
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 850,
              fontSize: { xs: '2.1rem', sm: '3.2rem', md: '3.8rem' },
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: '#0F172A',
              maxWidth: 960,
              mx: 'auto',
              mb: 2.5,
            }}
          >
            {t('landing.hero_headline')}
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '1rem', sm: '1.2rem' },
              fontWeight: 400,
              color: '#475569',
              maxWidth: 780,
              mx: 'auto',
              mb: 4.5,
              lineHeight: 1.6,
            }}
          >
            {t('landing.hero_sub')}
          </Typography>

          {/* Primary Action Buttons */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
            sx={{ mb: 6 }}
          >
            {isAuthenticated ? (
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/dashboard"
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{
                  py: 1.6,
                  px: 4,
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  borderRadius: 3,
                  bgcolor: '#0F172A',
                  '&:hover': { bgcolor: '#1E293B' },
                  boxShadow: '0 10px 25px rgba(15, 23, 42, 0.25)',
                }}
              >
                {t('landing.btn_go_workspace')}
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  size="large"
                  component={RouterLink}
                  to="/register"
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{
                    py: 1.6,
                    px: 3.5,
                    fontSize: '1.02rem',
                    fontWeight: 700,
                    borderRadius: 3,
                    bgcolor: '#4F46E5',
                    '&:hover': { bgcolor: '#4338CA' },
                    boxShadow: '0 10px 25px rgba(79, 70, 229, 0.3)',
                  }}
                >
                  {t('landing.btn_register_firm')}
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  component={RouterLink}
                  to="/login"
                  sx={{
                    py: 1.6,
                    px: 3.5,
                    fontSize: '1.02rem',
                    fontWeight: 700,
                    borderRadius: 3,
                    borderColor: '#CBD5E1',
                    color: '#0F172A',
                    bgcolor: '#FFFFFF',
                    '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
                  }}
                >
                  {t('landing.btn_advisor_signin')}
                </Button>

                <Button
                  variant="text"
                  size="large"
                  onClick={() => scrollToSection('pricing')}
                  sx={{
                    py: 1.6,
                    px: 2.5,
                    fontSize: '0.98rem',
                    fontWeight: 600,
                    color: '#475569',
                    '&:hover': { color: '#0F172A' },
                  }}
                >
                  {t('landing.btn_view_pricing')}
                </Button>
              </>
            )}
          </Stack>

          {/* Social Proof & Metrics Strip */}
          <Grid container spacing={2} sx={{ maxWidth: 900, mx: 'auto', mt: 2 }}>
            {[
              { stat: t('landing.stat_assets'), label: t('landing.stat_assets_label') },
              { stat: t('landing.stat_sebi'), label: t('landing.stat_sebi_label') },
              { stat: t('landing.stat_speed'), label: t('landing.stat_speed_label') },
              { stat: t('landing.stat_archival'), label: t('landing.stat_archival_label') },
            ].map((item, idx) => (
              <Grid key={idx} size={{ xs: 6, md: 3 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="h6" fontWeight={800} color="#0F172A">
                    {item.stat}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    {item.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* THE REGULATORY PROBLEM SECTION */}
      <Box sx={{ py: { xs: 8, md: 10 }, px: { xs: 2, sm: 4 }, bgcolor: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6, maxWidth: 760, mx: 'auto' }}>
            <Typography variant="overline" fontWeight={800} color="primary" sx={{ letterSpacing: '0.08em' }}>
              THE REGULATORY CONTEXT
            </Typography>
            <Typography variant="h3" fontWeight={800} sx={{ mt: 1, color: '#0F172A', fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
              Why Informal Approvals Put Your RIA License in Jeopardy
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5 }}>
              Under SEBI (Investment Advisers) Regulations, 2013, non-discretionary execution is strictly enforced.
              Casual messaging channels fail statutory evidentiary thresholds.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {[
              {
                icon: <GavelOutlinedIcon sx={{ fontSize: 36, color: '#DC2626' }} />,
                title: 'Strict Liability under Reg. 19',
                desc: 'Executing trades without explicit, prior informed client consent constitutes unauthorised discretion. SEBI enforcement actions routinely impose license suspension and statutory penalties.',
                stat: 'Penalty Risk: License Suspension',
              },
              {
                icon: <LockOutlinedIcon sx={{ fontSize: 36, color: '#D97706' }} />,
                title: 'Section 65B Inadmissibility',
                desc: 'WhatsApp screenshots, SMS records, and phone audio logs fail Indian Evidence Act Section 65B requirements without cryptographic timestamps, SHA-256 digests, and certified device metadata.',
                stat: 'Evidentiary Status: Inadmissible in Disputes',
              },
              {
                icon: <CalculateOutlinedIcon sx={{ fontSize: 36, color: '#2563EB' }} />,
                title: 'Surprise Tax Liabilities & Penalties',
                desc: 'Executing rebalancing without prior capital gains disclosure triggers STCG (20%) and LTCG (12.5%) shocks, leading to investor disputes and Section 234B/234C advance tax interest penalties.',
                stat: 'Tax Shock: 20% STCG + Interest 234B/C',
              },
            ].map((risk, i) => (
              <Grid key={i} size={{ xs: 12, md: 4 }}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    p: 3,
                    borderRadius: 3.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: '#F8FAFC',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.06)',
                      borderColor: 'primary.light',
                    },
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ mb: 2 }}>{risk.icon}</Box>
                    <Typography variant="h6" fontWeight={750} color="#0F172A" gutterBottom>
                      {risk.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
                      {risk.desc}
                    </Typography>
                    <Chip
                      label={risk.stat}
                      size="small"
                      sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: 'rgba(0,0,0,0.05)' }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CORE VALUE PROPOSITION SECTION */}
      <Box id="value-proposition" sx={{ py: { xs: 8, md: 12 }, px: { xs: 2, sm: 4 }, bgcolor: '#F8FAFC', borderTop: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 7, maxWidth: 800, mx: 'auto' }}>
            <Typography variant="overline" fontWeight={800} color="primary" sx={{ letterSpacing: '0.08em' }}>
              VALUE PROPOSITION
            </Typography>
            <Typography variant="h3" fontWeight={800} sx={{ mt: 1, color: '#0F172A', fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
              The Three Pillars of FinConsent Infrastructure
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5 }}>
              Engineered specifically for SEBI Registered Investment Advisers, Family Offices, and Wealth Advisory practices.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* Pillar 1 */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card elevation={1} sx={{ p: 3.5, borderRadius: 3.5, height: '100%', border: 1, borderColor: 'divider', bgcolor: '#FFFFFF' }}>
                <Box sx={{ p: 1.2, width: 48, height: 48, borderRadius: 2.5, bgcolor: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
                  <SpeedOutlinedIcon sx={{ color: '#4F46E5', fontSize: 28 }} />
                </Box>
                <Typography variant="h5" fontWeight={750} color="#0F172A" gutterBottom>
                  1. Zero-Friction Client Consent
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.65 }}>
                  Investors receive a secure, tokenized proposal link via WhatsApp or email. <strong>No app install or login required</strong>.
                  Clients review the proposed asset allocation shift side-by-side with trade baskets and authorize in seconds using 6-digit Mobile OTP.
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[
                    'Automated client allocation in draft creation',
                    'Mobile-first responsive investor approval interface',
                    '48-hour automated cutoff & revocation protection',
                  ].map((text, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleRoundedIcon color="success" sx={{ fontSize: 18 }} />
                      <Typography variant="caption" fontWeight={600} color="#334155">{text}</Typography>
                    </Box>
                  ))}
                </Box>
              </Card>
            </Grid>

            {/* Pillar 2 */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card elevation={1} sx={{ p: 3.5, borderRadius: 3.5, height: '100%', border: 1, borderColor: 'divider', bgcolor: '#FFFFFF' }}>
                <Box sx={{ p: 1.2, width: 48, height: 48, borderRadius: 2.5, bgcolor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
                  <CalculateOutlinedIcon sx={{ color: '#059669', fontSize: 28 }} />
                </Box>
                <Typography variant="h5" fontWeight={750} color="#0F172A" gutterBottom>
                  2. Real-Time Pre-Computed Tax Engine
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.65 }}>
                  Calculates Short-Term Capital Gains (STCG @ 20%) and Long-Term Capital Gains (LTCG @ 12.5% above ₹1.25L exemption) based on Budget 2024.
                  Automatically alerts clients of quarterly Section 234B/234C advance tax liability prior to authorization.
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[
                    'Budget 2024 revised capital gains tax formulas',
                    'Dynamic Section 234B/234C advance tax warning banner',
                    'Zero year-end tax surprises for wealth advisory clients',
                  ].map((text, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleRoundedIcon color="success" sx={{ fontSize: 18 }} />
                      <Typography variant="caption" fontWeight={600} color="#334155">{text}</Typography>
                    </Box>
                  ))}
                </Box>
              </Card>
            </Grid>

            {/* Pillar 3 */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card elevation={1} sx={{ p: 3.5, borderRadius: 3.5, height: '100%', border: 1, borderColor: 'divider', bgcolor: '#FFFFFF' }}>
                <Box sx={{ p: 1.2, width: 48, height: 48, borderRadius: 2.5, bgcolor: 'rgba(2, 132, 199, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
                  <ReceiptLongOutlinedIcon sx={{ color: '#0284C7', fontSize: 28 }} />
                </Box>
                <Typography variant="h5" fontWeight={750} color="#0F172A" gutterBottom>
                  3. Tamper-Evident Regulation 19 Dossiers
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.65 }}>
                  Every mandate transition is locked into an append-only cryptographic audit trail. IP addresses, user agents, timestamps, and OTP challenges
                  are hashed into SHA-256 digests. Generates complete Regulation 19 compliance dossiers ready for immediate SEBI inspection.
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[
                    'SHA-256 cryptographic hash-chained audit timeline',
                    'Admissible Section 65B Evidence Act statutory receipts',
                    'Automated 5-year data retention in AWS Mumbai',
                  ].map((text, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleRoundedIcon color="success" sx={{ fontSize: 18 }} />
                      <Typography variant="caption" fontWeight={600} color="#334155">{text}</Typography>
                    </Box>
                  ))}
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* HOW IT WORKS 4-STEP WORKFLOW */}
      <Box id="how-it-works" sx={{ py: { xs: 8, md: 10 }, px: { xs: 2, sm: 4 }, bgcolor: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 7, maxWidth: 760, mx: 'auto' }}>
            <Typography variant="overline" fontWeight={800} color="primary" sx={{ letterSpacing: '0.08em' }}>
              HOW IT WORKS
            </Typography>
            <Typography variant="h3" fontWeight={800} sx={{ mt: 1, color: '#0F172A', fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
              From Portfolio Draft to Locked SEBI Evidence in 4 Steps
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {[
              {
                step: '01',
                title: 'Draft Mandate with Automated Allocation',
                desc: 'Adviser selects target portfolio allocation (e.g. 70/20 to 60/25). Client is automatically and randomly allocated from active database with 1-click re-roll.',
              },
              {
                step: '02',
                title: 'Instant Tax & Capital Gains Preview',
                desc: 'Engine calculates STCG @ 20%, LTCG @ 12.5%, and evaluates advance tax liability for the active quarter (Q1-Q4).',
              },
              {
                step: '03',
                title: 'Client Authorizes via Mobile OTP',
                desc: 'Client opens the proposal URL, reviews pre-computed tax obligations and trade basket, and verifies consent with instant 6-digit OTP.',
              },
              {
                step: '04',
                title: 'Regulation 19 Dossier Locked',
                desc: 'Immutable certificate is generated with SHA-256 digest, preserved for 5 years in AWS Mumbai, and ready for SEBI inspection audit.',
              },
            ].map((step, idx) => (
              <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: '#F8FAFC',
                    border: '1px solid',
                    borderColor: 'divider',
                    height: '100%',
                    position: 'relative',
                  }}
                >
                  <Typography
                    variant="h4"
                    fontWeight={900}
                    color="primary.light"
                    sx={{ opacity: 0.5, mb: 1, fontFamily: 'monospace' }}
                  >
                    {step.step}
                  </Typography>
                  <Typography variant="h6" fontWeight={750} color="#0F172A" gutterBottom>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {step.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* PRICING SECTION */}
      <Box id="pricing" sx={{ py: { xs: 8, md: 12 }, px: { xs: 2, sm: 4 }, bgcolor: '#F8FAFC', borderTop: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 7, maxWidth: 780, mx: 'auto' }}>
            <Typography variant="overline" fontWeight={800} color="primary" sx={{ letterSpacing: '0.08em' }}>
              TRANSPARENT PRICING
            </Typography>
            <Typography variant="h3" fontWeight={800} sx={{ mt: 1, color: '#0F172A', fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
              {t('landing.pricing_title')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5 }}>
              {t('landing.pricing_sub')}
            </Typography>
          </Box>

          <Grid container spacing={4} alignItems="stretch">
            {/* Tier 1: Free Sandbox */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card elevation={0} sx={{ p: 4, borderRadius: 3.5, height: '100%', border: 1, borderColor: 'divider', bgcolor: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                  STARTER SANDBOX
                </Typography>
                <Typography variant="h4" fontWeight={800} sx={{ my: 1.5, color: '#0F172A' }}>
                  ₹0
                  <Typography component="span" variant="body2" color="text.secondary"> / forever</Typography>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Ideal for testing FinConsent workflows and statutory tax engine algorithms.
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexGrow: 1, mb: 4 }}>
                  {[
                    '3 active rebalancing mandates',
                    'Full Budget 2024 Capital Gains Tax Engine',
                    'Standard client proposal links',
                    'Pre-loaded benchmark compliance records',
                    'Community compliance documentation',
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleRoundedIcon color="success" sx={{ fontSize: 18 }} />
                      <Typography variant="body2" color="#334155">{item}</Typography>
                    </Box>
                  ))}
                </Box>
                <Button
                  variant="outlined"
                  fullWidth
                  component={RouterLink}
                  to="/login"
                  sx={{ py: 1.4, borderRadius: 2.5, fontWeight: 700 }}
                >
                  Start Free Sandbox
                </Button>
              </Card>
            </Grid>

            {/* Tier 2: Pro RIA (Recommended) */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                elevation={4}
                sx={{
                  p: 4,
                  borderRadius: 3.5,
                  height: '100%',
                  border: 2,
                  borderColor: 'primary.main',
                  bgcolor: '#FFFFFF',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 20px 40px rgba(79, 70, 229, 0.12)',
                }}
              >
                <Chip
                  label="MOST POPULAR FOR RIAs"
                  color="primary"
                  size="small"
                  sx={{ position: 'absolute', top: -12, right: 24, fontWeight: 800, fontSize: '0.7rem' }}
                />
                <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                  PRO RIA PRACTITIONER
                </Typography>
                <Typography variant="h4" fontWeight={800} sx={{ my: 1.5, color: '#0F172A' }}>
                  ₹2,499
                  <Typography component="span" variant="body2" color="text.secondary"> / month (+ GST)</Typography>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Everything an active SEBI Registered Investment Adviser needs for non-discretionary operations.
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexGrow: 1, mb: 4 }}>
                  {[
                    'Unlimited active trade rebalance mandates',
                    'Up to 150 active HNI advisory clients',
                    'White-labeled portal with firm logo & INA number',
                    'TRAI DLT-compliant Mobile OTP verification',
                    '5-year statutory append-only AWS Mumbai archival',
                    '1-Click Regulation 19 audit dossier export',
                    'Direct Razorpay subscription upgrade',
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleRoundedIcon color="primary" sx={{ fontSize: 18 }} />
                      <Typography variant="body2" fontWeight={600} color="#0F172A">{item}</Typography>
                    </Box>
                  ))}
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  component={RouterLink}
                  to="/settings/billing"
                  sx={{
                    py: 1.4,
                    borderRadius: 2.5,
                    fontWeight: 700,
                    bgcolor: '#4F46E5',
                    '&:hover': { bgcolor: '#4338CA' },
                  }}
                >
                  Upgrade to Pro RIA Tier
                </Button>
              </Card>
            </Grid>

            {/* Tier 3: Enterprise */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card elevation={0} sx={{ p: 4, borderRadius: 3.5, height: '100%', border: 1, borderColor: 'divider', bgcolor: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                  ENTERPRISE & PMS DESK
                </Typography>
                <Typography variant="h4" fontWeight={800} sx={{ my: 1.5, color: '#0F172A' }}>
                  ₹8,999
                  <Typography component="span" variant="body2" color="text.secondary"> / month (+ GST)</Typography>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  For multi-partner advisory firms, wealth management desks, and corporate entities.
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexGrow: 1, mb: 4 }}>
                  {[
                    'Unlimited advisory clients & partner sub-accounts',
                    'Dedicated Compliance Officer supervisory portal',
                    'Advisory Request composition & scrutiny queues',
                    'Custom broker / custodian execution webhooks',
                    'Multi-partner Role-Based Access Control',
                    'Priority SLA & annual statutory audit assistance',
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleRoundedIcon color="success" sx={{ fontSize: 18 }} />
                      <Typography variant="body2" color="#334155">{item}</Typography>
                    </Box>
                  ))}
                </Box>
                <Button
                  variant="outlined"
                  fullWidth
                  component={RouterLink}
                  to="/requests/new"
                  sx={{ py: 1.4, borderRadius: 2.5, fontWeight: 700 }}
                >
                  Contact Compliance Sales
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 1-CLICK INTERACTIVE TEST-DRIVE LAUNCHER */}
      <Box sx={{ py: { xs: 8, md: 10 }, px: { xs: 2, sm: 4 }, bgcolor: '#0B132B', color: '#F8FAFC' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Chip
              label="INSTANT TEST DRIVE"
              size="small"
              sx={{ bgcolor: 'rgba(99, 102, 241, 0.2)', color: '#818CF8', fontWeight: 800, mb: 2 }}
            />
            <Typography variant="h3" fontWeight={800} sx={{ color: '#FFFFFF', fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
              Experience FinConsent Across All 4 Established Roles
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1, maxWidth: 640, mx: 'auto' }}>
              Click any role to test-drive FinConsent immediately with our realistic 1,000-user database:
            </Typography>
          </Box>

          <Grid container spacing={2.5}>
            {[
              {
                role: 'Registered Investment Adviser (RIA)',
                email: 'ria@example.in',
                icon: <BusinessCenterOutlinedIcon sx={{ color: '#818CF8', fontSize: 32 }} />,
                desc: 'Draft rebalancing proposals, utilize automated client allocation, trigger OTP dispatch, and manage billing.',
                badge: 'Drafting Lead',
              },
              {
                role: 'Advisory Client (Investor)',
                email: 'client@example.in',
                icon: <PersonOutlineIcon sx={{ color: '#34D399', fontSize: 32 }} />,
                desc: 'Review proposed equity/debt shifts, inspect pre-computed STCG/LTCG tax, and authorize with Mobile OTP.',
                badge: 'Investor View',
              },
              {
                role: 'Compliance & Audit Officer',
                email: 'compliance@example.in',
                icon: <VerifiedUserOutlinedIcon sx={{ color: '#38BDF8', fontSize: 32 }} />,
                desc: 'Audit tamper-evident SHA-256 logs, review advisory requests scrutiny queue, and download dossiers.',
                badge: 'Auditor View',
              },
              {
                role: 'Platform Administrator',
                email: 'admin@example.in',
                icon: <ShieldOutlinedIcon sx={{ color: '#F472B6', fontSize: 32 }} />,
                desc: 'System governance, user role assignments, database health monitoring, and billing oversight.',
                badge: 'Superuser',
              },
            ].map((p, idx) => (
              <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  elevation={0}
                  onClick={() => handleQuickTestDrive(p.email)}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(99, 102, 241, 0.15)',
                      borderColor: '#818CF8',
                      transform: 'translateY(-3px)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    {p.icon}
                    <Chip label={p.badge} size="small" sx={{ fontSize: '0.65rem', bgcolor: 'rgba(255,255,255,0.1)', color: '#FFFFFF' }} />
                  </Box>
                  <Typography variant="subtitle1" fontWeight={750} gutterBottom>
                    {p.role}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.5, flexGrow: 1, display: 'block', mb: 2 }}>
                    {p.desc}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{
                      color: '#818CF8',
                      borderColor: 'rgba(129, 140, 248, 0.4)',
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 700,
                    }}
                  >
                    Launch Role →
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
