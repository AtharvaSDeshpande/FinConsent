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
import Alert from '@mui/material/Alert';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import NotInterestedOutlinedIcon from '@mui/icons-material/NotInterestedOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Logo } from '../../components/brand/Logo.jsx';
import { useAuth } from '../../security/AuthContext.jsx';
import { useI18n } from '../../i18n/I18nContext';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();
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
      {/* 1. HERO SECTION */}
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
          {/* Advisory Workflow Pill */}
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
              maxWidth: '100%',
              height: 'auto',
              '& .MuiChip-label': {
                whiteSpace: 'normal',
                py: 0.4,
              },
            }}
          />

          {/* Main Headline */}
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 850,
              fontSize: { xs: '1.75rem', sm: '2.75rem', md: '3.3rem' },
              lineHeight: 1.2,
              letterSpacing: '-0.03em',
              color: '#0F172A',
              maxWidth: 960,
              mx: 'auto',
              mb: 2.5,
            }}
          >
            {t('landing.hero_headline')}
          </Typography>

          {/* Subtitle: One-Sentence Positioning Statement */}
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '1.02rem', sm: '1.2rem' },
              fontWeight: 450,
              color: '#334155',
              maxWidth: 860,
              mx: 'auto',
              mb: 4.5,
              lineHeight: 1.65,
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
                  onClick={() => scrollToSection('workflow-challenges')}
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

          {/* Truthful Capabilities Strip (No Fabricated Metrics) */}
          <Grid container spacing={2} sx={{ maxWidth: 960, mx: 'auto', mt: 2 }}>
            {[
              { stat: t('landing.stat_assets'), label: t('landing.stat_assets_label') },
              { stat: t('landing.stat_sebi'), label: t('landing.stat_sebi_label') },
              { stat: t('landing.stat_speed'), label: t('landing.stat_speed_label') },
              { stat: t('landing.stat_archival'), label: t('landing.stat_archival_label') },
            ].map((item, idx) => (
              <Grid key={idx} item xs={12} sm={6} md={3} size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.2,
                    borderRadius: 2.5,
                    bgcolor: 'rgba(255, 255, 255, 0.85)',
                    border: '1px solid',
                    borderColor: 'divider',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={800} color="#0F172A" gutterBottom>
                    {item.stat}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ lineHeight: 1.4 }}>
                    {item.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 2. THE PRACTICAL WORKFLOW CHALLENGE SECTION */}
      <Box id="workflow-challenges" sx={{ py: { xs: 8, md: 10 }, px: { xs: 2, sm: 4 }, bgcolor: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6, maxWidth: 840, mx: 'auto' }}>
            <Typography variant="overline" fontWeight={800} color="primary" sx={{ letterSpacing: '0.08em' }}>
              THE WORKFLOW CHALLENGE
            </Typography>
            <Typography variant="h3" fontWeight={800} sx={{ mt: 1, color: '#0F172A', fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
              The Operational Reality of Non-Discretionary Rebalancing
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.7 }}>
              Explaining proposed asset allocation shifts, showing estimated capital gains tax impacts, and maintaining unified records
              across disparate communication channels presents practical workflow friction for advisory practices.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {[
              {
                icon: <CalculateOutlinedIcon sx={{ fontSize: 36, color: '#2563EB' }} />,
                title: 'Pre-Trade Tax Transparency',
                desc: 'Hypothesis: Investors frequently hesitate or push back on rebalancing proposals when capital gains implications are unclear. Pre-computing STCG (20%) and LTCG (12.5% above ₹1.25L exemption) gives clients upfront visibility before they decide.',
                chip: 'Workflow Hypothesis: Tax Friction',
              },
              {
                icon: <SwapVertIcon sx={{ fontSize: 36, color: '#D97706' }} />,
                title: 'Multi-Channel Fragmentation',
                desc: 'Hypothesis: Advisory practices often coordinate rebalances across email threads, WhatsApp messages, PDF attachments, and phone calls. Dispersed records make it difficult to assemble a unified timeline of what was recommended and acknowledged.',
                chip: 'Workflow Hypothesis: Dispersed Records',
              },
              {
                icon: <GavelOutlinedIcon sx={{ fontSize: 36, color: '#7C3AED' }} />,
                title: 'Documenting Client Acknowledgement',
                desc: 'Hypothesis: While SEBI regulations require advisers to act on client instructions, demonstrating exactly what recommendation was shared and how the client responded requires consistent, tamper-evident recordkeeping across existing tools.',
                chip: 'Workflow Hypothesis: Evidentiary Record',
              },
            ].map((risk, i) => (
              <Grid key={i} item xs={12} md={4} size={{ xs: 12, md: 4 }}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    p: 3,
                    borderRadius: 3.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: '#F8FAFC',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.06)',
                      borderColor: 'primary.light',
                    },
                  }}
                >
                  <CardContent sx={{ p: 0, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ mb: 2 }}>{risk.icon}</Box>
                    <Typography variant="h6" fontWeight={750} color="#0F172A" gutterBottom>
                      {risk.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.65, flexGrow: 1 }}>
                      {risk.desc}
                    </Typography>
                    <Chip
                      label={risk.chip}
                      size="small"
                      sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: 'rgba(0,0,0,0.05)', alignSelf: 'flex-start' }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Acknowledging Existing Alternatives Banner */}
          <Paper
            elevation={0}
            sx={{
              mt: 5,
              p: 3,
              borderRadius: 3,
              bgcolor: 'rgba(248, 250, 252, 0.9)',
              border: '1px solid #E2E8F0',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <InfoOutlinedIcon sx={{ color: '#4F46E5', fontSize: 24, mt: 0.2 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={750} color="#0F172A" gutterBottom>
                  Acknowledging Existing Alternatives & Market Practices
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                  Advisory practices currently utilize email, WhatsApp, bespoke PDFs, e-signature tools, smallcase, and broker basket-order tools.
                  FinConsent is designed to complement existing tools by keeping the proposal, estimated tax disclosure, and client response in one
                  unified, auditable timeline. <strong>Note:</strong> SEBI does not universally mandate SMS OTP per rebalance; OTP in FinConsent is an in-app
                  simulated workflow pattern for demonstrating explicit confirmation.
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* 3. CORE VALUE PROPOSITION SECTION */}
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
              Designed to help SEBI-Registered Investment Advisers communicate clearly, disclose estimated taxes, and keep audit-ready records.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* Pillar 1 */}
            <Grid item xs={12} md={4} size={{ xs: 12, md: 4 }}>
              <Card elevation={1} sx={{ p: 3.5, borderRadius: 3.5, height: '100%', border: 1, borderColor: 'divider', bgcolor: '#FFFFFF' }}>
                <Box sx={{ p: 1.2, width: 48, height: 48, borderRadius: 2.5, bgcolor: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
                  <SpeedOutlinedIcon sx={{ color: '#4F46E5', fontSize: 28 }} />
                </Box>
                <Typography variant="h5" fontWeight={750} color="#0F172A" gutterBottom>
                  1. Structured Client Proposal Review
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.65 }}>
                  Clients access the proposal via a secure tokenized link on mobile with zero app installation.
                  Investors review proposed allocation shifts side-by-side with trade details before deciding.
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[
                    'Mobile-first responsive proposal review interface',
                    'Side-by-side current vs target portfolio allocation',
                    'Configurable cutoff window to prevent stale valuations',
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
            <Grid item xs={12} md={4} size={{ xs: 12, md: 4 }}>
              <Card elevation={1} sx={{ p: 3.5, borderRadius: 3.5, height: '100%', border: 1, borderColor: 'divider', bgcolor: '#FFFFFF' }}>
                <Box sx={{ p: 1.2, width: 48, height: 48, borderRadius: 2.5, bgcolor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
                  <CalculateOutlinedIcon sx={{ color: '#059669', fontSize: 28 }} />
                </Box>
                <Typography variant="h5" fontWeight={750} color="#0F172A" gutterBottom>
                  2. Pre-Computed Tax Engine
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.65 }}>
                  Pre-computes Short-Term Capital Gains (STCG @ 20%) and Long-Term Capital Gains (LTCG @ 12.5% above ₹1.25L exemption)
                  under Budget 2024 rates, highlighting advance tax considerations prior to authorization.
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[
                    'Budget 2024 revised capital gains tax formulas',
                    'Illustrative Section 234B/234C advance tax reminders',
                    'Clear disclosure: pre-computed estimates, not tax advice',
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
            <Grid item xs={12} md={4} size={{ xs: 12, md: 4 }}>
              <Card elevation={1} sx={{ p: 3.5, borderRadius: 3.5, height: '100%', border: 1, borderColor: 'divider', bgcolor: '#FFFFFF' }}>
                <Box sx={{ p: 1.2, width: 48, height: 48, borderRadius: 2.5, bgcolor: 'rgba(2, 132, 199, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
                  <ReceiptLongOutlinedIcon sx={{ color: '#0284C7', fontSize: 28 }} />
                </Box>
                <Typography variant="h5" fontWeight={750} color="#0F172A" gutterBottom>
                  3. Tamper-Evident Recordkeeping
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.65 }}>
                  Records every state transition with a cryptographic SHA-256 digest, logging IP address, user agent, timestamp,
                  and in-app verification event into an exportable compliance dossier.
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[
                    'SHA-256 cryptographic state transition logging',
                    'Exportable Regulation 19 compliance summary dossier',
                    'Demonstrates tamper-evident recording capabilities',
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

      {/* 4. HOW IT WORKS 4-STEP WORKFLOW */}
      <Box id="how-it-works" sx={{ py: { xs: 8, md: 10 }, px: { xs: 2, sm: 4 }, bgcolor: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 7, maxWidth: 760, mx: 'auto' }}>
            <Typography variant="overline" fontWeight={800} color="primary" sx={{ letterSpacing: '0.08em' }}>
              HOW IT WORKS
            </Typography>
            <Typography variant="h3" fontWeight={800} sx={{ mt: 1, color: '#0F172A', fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
              From Portfolio Draft to Logged Evidence in 4 Steps
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {[
              {
                step: '01',
                title: 'Draft Mandate & Review Target Weights',
                desc: 'Adviser defines proposed allocation shift and rationale. For rapid demonstration, the prototype pre-selects a synthetic client profile with 1-click re-roll convenience.',
              },
              {
                step: '02',
                title: 'Inspect Pre-Computed Tax Estimates',
                desc: 'Engine calculates estimated STCG @ 20%, LTCG @ 12.5% above ₹1.25L exemption, and flags advance tax timing considerations.',
              },
              {
                step: '03',
                title: 'Client Reviews on Mobile & Enters In-App OTP',
                desc: 'Client opens the proposal URL, reviews allocation changes and estimated taxes, and enters the simulated 6-digit in-app OTP (no live SMS required).',
              },
              {
                step: '04',
                title: 'Tamper-Evident Transition Log Recorded',
                desc: 'A timestamped SHA-256 record is committed to the local prototype store, ready for PDF export or internal compliance inspection.',
              },
            ].map((step, idx) => (
              <Grid key={idx} item xs={12} sm={6} md={3} size={{ xs: 12, sm: 6, md: 3 }}>
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

      {/* 5. CONSENT CLARITY ASSISTANT: BEHAVIOUR SPECIFICATION (IMPLEMENTED IN PROTOTYPE) */}
      <Box sx={{ py: { xs: 8, md: 10 }, px: { xs: 2, sm: 4 }, bgcolor: '#F8FAFC', borderTop: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6, maxWidth: 820, mx: 'auto' }}>
            <Chip
              icon={<SmartToyOutlinedIcon sx={{ fontSize: '16px !important' }} />}
              label="AI FEATURE • IMPLEMENTED IN PROTOTYPE"
              size="small"
              sx={{ bgcolor: 'rgba(79, 70, 229, 0.1)', color: '#4F46E5', fontWeight: 800, mb: 2 }}
            />
            <Typography variant="h3" fontWeight={800} sx={{ color: '#0F172A', fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
              Consent Clarity Assistant: Clarification Architecture
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.65 }}>
              The Consent Clarity Assistant answers client questions using only data from their unlocked rebalancing proposal. When a question is outside the proposal or asks for advice, it hands over to the human adviser.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {[
              {
                icon: <AutoAwesomeOutlinedIcon sx={{ color: '#4F46E5', fontSize: 32 }} />,
                title: 'Proposal-Grounded Explanations',
                desc: 'Strictly limited to the RIA\'s written rationale, asset target weights, and pre-computed figures contained in the proposal. Refuses to answer general financial or speculative queries outside the proposal payload.',
              },
              {
                icon: <InfoOutlinedIcon sx={{ color: '#0284C7', fontSize: 32 }} />,
                title: 'Estimate Disclaimers on Tax Queries',
                desc: 'Reiterates on every tax-related explanation that capital gains calculations are pre-computed estimates under Budget 2024 rules and do not constitute certified tax advice or official tax filings.',
              },
              {
                icon: <NotInterestedOutlinedIcon sx={{ color: '#DC2626', fontSize: 32 }} />,
                title: 'Strict Refusal to Advise or Consent',
                desc: 'Programmatically refuses to make investment recommendations, endorse trades, or give consent on behalf of the client. Only the investor can authorize a rebalancing proposal.',
              },
              {
                icon: <SecurityOutlinedIcon sx={{ color: '#059669', fontSize: 32 }} />,
                title: 'Privacy Boundaries & Adviser Hand-Off',
                desc: 'Maintains strict session confidentiality with zero training on client confidential data. Automatically routes complex inquiries or low-confidence questions to the human RIA.',
              },
            ].map((pillar, idx) => (
              <Grid key={idx} item xs={12} sm={6} md={3} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: '#FFFFFF',
                    border: '1px solid',
                    borderColor: 'divider',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box sx={{ mb: 2 }}>{pillar.icon}</Box>
                  <Typography variant="subtitle1" fontWeight={750} color="#0F172A" gutterBottom>
                    {pillar.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, flexGrow: 1 }}>
                    {pillar.desc}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 6. PROTOTYPE SCOPE: WHAT FINCONSENT DOES AND DOES NOT DO */}
      <Box sx={{ py: { xs: 8, md: 10 }, px: { xs: 2, sm: 4 }, bgcolor: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6, maxWidth: 800, mx: 'auto' }}>
            <Typography variant="overline" fontWeight={800} color="primary" sx={{ letterSpacing: '0.08em' }}>
              PROTOTYPE DISCLOSURES
            </Typography>
            <Typography variant="h3" fontWeight={800} sx={{ mt: 1, color: '#0F172A', fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
              Prototype Scope: What FinConsent Does and Does Not Do
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5 }}>
              Transparent boundaries regarding the capabilities and limitations of this demonstration build.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* What it DOES */}
            <Grid item xs={12} md={6} size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3.5,
                  borderRadius: 3.5,
                  border: '1.5px solid #BBF7D0',
                  bgcolor: '#F0FDF4',
                  height: '100%',
                }}
              >
                <Typography variant="h6" fontWeight={800} color="#166534" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleRoundedIcon color="success" /> What Prototype v0 Demonstrates
                </Typography>
                <Box sx={{ mt: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[
                    'Synthetic test data for 4 established roles (RIA, Client, Compliance, Admin)',
                    'Automated pre-computation of Budget 2024 capital gains estimates (STCG 20%, LTCG 12.5%)',
                    'Mobile-friendly proposal review interface with password-protected token links',
                    'Simulated in-app 6-digit OTP verification workflow for evaluation',
                    'Tamper-evident SHA-256 state transition logging and compliance dossier export',
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <CheckCircleRoundedIcon color="success" sx={{ fontSize: 18, mt: 0.3 }} />
                      <Typography variant="body2" color="#1E293B" sx={{ lineHeight: 1.6 }}>{item}</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>

            {/* What it DOES NOT */}
            <Grid item xs={12} md={6} size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3.5,
                  borderRadius: 3.5,
                  border: '1.5px solid #FECACA',
                  bgcolor: '#FEF2F2',
                  height: '100%',
                }}
              >
                <Typography variant="h6" fontWeight={800} color="#991B1B" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NotInterestedOutlinedIcon color="error" /> What Prototype v0 Does NOT Do
                </Typography>
                <Box sx={{ mt: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[
                    'Does NOT execute trades (orders must be placed independently via broker/custodian)',
                    'Does NOT replace the formal client-adviser advisory agreement',
                    'Does NOT guarantee statutory compliance or legal admissibility in court',
                    'Has NO live SMS or WhatsApp delivery (uses mocked in-app OTP and simulated links)',
                    'Does NOT provide certified tax advice or file official tax returns',
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <NotInterestedOutlinedIcon color="error" sx={{ fontSize: 18, mt: 0.3 }} />
                      <Typography variant="body2" color="#1E293B" sx={{ lineHeight: 1.6 }}>{item}</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 7. INTERACTIVE TEST-DRIVE LAUNCHER */}
      <Box sx={{ py: { xs: 8, md: 10 }, px: { xs: 2, sm: 4 }, bgcolor: '#0B132B', color: '#F8FAFC' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Chip
              label="INSTANT TEST DRIVE (SYNTHETIC PROFILES)"
              size="small"
              sx={{ bgcolor: 'rgba(99, 102, 241, 0.2)', color: '#818CF8', fontWeight: 800, mb: 2 }}
            />
            <Typography variant="h3" fontWeight={800} sx={{ color: '#FFFFFF', fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
              Experience FinConsent Across All 4 Established Roles
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.75)', mt: 1, maxWidth: 720, mx: 'auto' }}>
              Click any role to test-drive FinConsent immediately with pre-seeded synthetic test profiles (password: <code>Password@123</code>):
            </Typography>
          </Box>

          <Grid container spacing={2.5}>
            {[
              {
                role: 'Registered Investment Adviser (RIA)',
                email: 'ria@example.in',
                icon: <BusinessCenterOutlinedIcon sx={{ color: '#818CF8', fontSize: 32 }} />,
                desc: 'Draft rebalancing proposals, utilize test client picker, trigger OTP dispatch, and review audit history.',
                badge: 'Drafting Lead',
              },
              {
                role: 'Advisory Client (Investor)',
                email: 'client@example.in',
                icon: <PersonOutlineIcon sx={{ color: '#34D399', fontSize: 32 }} />,
                desc: 'Review proposed equity/debt shifts, inspect pre-computed STCG/LTCG tax, and authorize with in-app OTP.',
                badge: 'Investor View',
              },
              {
                role: 'Compliance & Audit Officer',
                email: 'compliance@example.in',
                icon: <VerifiedUserOutlinedIcon sx={{ color: '#38BDF8', fontSize: 32 }} />,
                desc: 'Audit tamper-evident SHA-256 state transition logs, review requests queue, and export compliance dossiers.',
                badge: 'Auditor View',
              },
              {
                role: 'Platform Administrator',
                email: 'admin@example.in',
                icon: <ShieldOutlinedIcon sx={{ color: '#F472B6', fontSize: 32 }} />,
                desc: 'System governance, synthetic user directory, database monitoring, and billing simulation oversight.',
                badge: 'Superuser',
              },
            ].map((p, idx) => (
              <Grid key={idx} item xs={12} sm={6} md={3} size={{ xs: 12, sm: 6, md: 3 }}>
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
