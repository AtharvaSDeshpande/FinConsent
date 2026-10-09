import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { Logo } from '../../components/brand/Logo.jsx';
import { StatutoryBadge } from '../../components/brand/StatutoryBadge.jsx';
import TextField from '@mui/material/TextField';
import { AdvanceTaxAlertBanner } from '../tax-engine/index.js';
import { OtpModal } from '../otp-consent/OtpModal.jsx';
import { MandateChat } from '../chat/MandateChat.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { formatCurrency } from '../../i18n/formatters.js';

export const ClientReviewPage = () => {
  const { t } = useI18n();
  const { token } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  // Password Unlock State
  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [unlockToken, setUnlockToken] = useState(() => sessionStorage.getItem(`finconsent_unlock_${token}`) || '');
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const fetchProposal = async () => {
      if (!token || token === 'undefined') {
        setError('Invalid or missing mandate token. Please request an active authorization link from your Registered Investment Adviser.');
        setLoading(false);
        return;
      }
      try {
        const savedUnlockToken = sessionStorage.getItem(`finconsent_unlock_${token}`);
        const headers = {};
        if (savedUnlockToken) {
          headers['x-unlock-token'] = savedUnlockToken;
        }

        const res = await fetch(`/api/public/mandates/${token}`, { headers });
        const result = await res.json();

        if (res.status === 410 || result.expired || result.status === 'expired') {
          setIsExpired(true);
          setData(result.mandate);
          return;
        }

        if (!res.ok || !result.success) {
          throw new Error(result.error || 'Failed to load mandate proposal');
        }

        // Check if sensitive financial data is unlocked
        const isPayloadLocked = result.requiresUnlock || (result.data?.isPasswordProtected && !result.data?.mandate?.sellBasket && !result.data?.mandate?.trades);
        if (isPayloadLocked) {
          setIsUnlocked(false);
          setData(result.data);
        } else {
          setIsUnlocked(true);
          if (savedUnlockToken) setUnlockToken(savedUnlockToken);
          setData(result.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [token]);

  const handleUnlockMandate = async (e) => {
    e?.preventDefault();
    if (!unlockPassword) return;
    setUnlocking(true);
    setUnlockError('');

    try {
      const res = await fetch(`/api/public/mandates/${token}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: unlockPassword.trim() }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'The password is incorrect or this mandate is unavailable.');
      }

      if (result.unlockToken) {
        sessionStorage.setItem(`finconsent_unlock_${token}`, result.unlockToken);
        setUnlockToken(result.unlockToken);
      }
      setData(result.data);
      setIsUnlocked(true);
      setUnlockPassword('');
    } catch (err) {
      setUnlockError(err.message || 'The password is incorrect or this mandate is unavailable.');
    } finally {
      setUnlocking(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 2 }}>
        <CircularProgress color="primary" />
        <Typography variant="body2" color="text.secondary">
          {t('common.loading')}
        </Typography>
      </Box>
    );
  }

  if (isExpired) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 }, textAlign: 'center' }}>
        <Card elevation={2} sx={{ p: { xs: 3, sm: 4.5 }, borderRadius: 4, border: 1, borderColor: 'error.light', bgcolor: '#FFFFFF' }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
            <AccessTimeOutlinedIcon sx={{ fontSize: 36, color: 'error.main' }} />
          </Box>
          <Typography variant="h5" fontWeight={800} color="#0F172A" gutterBottom>
            {t('client_review.window_expired_title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6 }}>
            {t('client_review.window_expired_desc')}
          </Typography>

          <Alert severity="info" sx={{ my: 3, textAlign: 'left', borderRadius: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={750} gutterBottom>
              {t('client_review.what_next_title')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.5 }}>
              {t('client_review.what_next_desc')}
            </Typography>
          </Alert>

          <Button
            variant="contained"
            color="primary"
            startIcon={<EmailOutlinedIcon />}
            href={`mailto:${data?.ria?.complianceEmail || 'advisor@firm.in'}?subject=Request for Updated Trade Rebalance Mandate`}
            sx={{ fontWeight: 700, borderRadius: 2.5, px: 3, py: 1.2 }}
          >
            {t('client_review.btn_contact_adviser')}
          </Button>
        </Card>
      </Container>
    );
  }

  // Password Unlock Card Screen (Sensitive data withheld until unlocked)
  if (!isUnlocked && data && (data.isPasswordProtected || data.requiresUnlock)) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 4, sm: 8 }, px: { xs: 2, sm: 3 } }}>
        <Card
          id="mandate_unlock_card"
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4.5 },
            borderRadius: 4,
            border: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.07)',
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3, textAlign: 'center' }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: 'rgba(79, 70, 229, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <LockOutlinedIcon sx={{ fontSize: 28, color: '#4F46E5' }} />
            </Box>
            <Typography variant="h5" component="h1" fontWeight={850} color="#0F172A" gutterBottom>
              {t('client_review.unlock_card_title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
              {t('client_review.unlock_card_desc')}
            </Typography>
          </Box>

          {/* Explanation Box - DO NOT EXPOSE ACTUAL PAN OR DOB */}
          <Box
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: 2.5,
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
            }}
          >
            <Typography variant="subtitle2" fontWeight={750} color="#1E293B" gutterBottom>
              {t('client_review.unlock_format_title')}
            </Typography>
            <Typography variant="body2" color="#475569" sx={{ mb: 1.5, lineHeight: 1.5 }}>
              {t('client_review.unlock_format_desc')}
            </Typography>
            <Box sx={{ p: 1.5, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px dashed #CBD5E1' }}>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', color: '#334155', fontWeight: 600 }}>
                {t('client_review.unlock_example_title')}
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', color: '#475569' }}>
                PAN ending: 1234
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', color: '#475569' }}>
                DOB: 07/03/1985
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', color: '#4F46E5', fontWeight: 700, mt: 0.5 }}>
                Password: 123407031985
              </Typography>
            </Box>
          </Box>

          {unlockError && (
            <Alert id="mandate_unlock_error" severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {unlockError}
            </Alert>
          )}

          {/* Unlock Form */}
          <Box component="form" onSubmit={handleUnlockMandate} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              id="mandate_password_input"
              label={t('mandate.unlock_password_helper')}
              type="password"
              placeholder={t('client_review.password_placeholder')}
              fullWidth
              required
              autoFocus
              value={unlockPassword}
              onChange={(e) => setUnlockPassword(e.target.value.trim())}
              inputProps={{ maxLength: 16 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  fontSize: '1rem',
                  letterSpacing: '1px',
                },
              }}
            />

            <Button
              id="mandate_unlock_submit_btn"
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={unlocking || !unlockPassword}
              startIcon={unlocking ? <CircularProgress size={18} color="inherit" /> : <LockOutlinedIcon />}
              sx={{
                py: 1.4,
                fontWeight: 750,
                borderRadius: 2.5,
                bgcolor: '#4F46E5',
                '&:hover': { bgcolor: '#4338CA' },
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
              }}
            >
              {unlocking ? t('client_review.unlocking') : t('client_review.unlock_button')}
            </Button>
          </Box>

          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.6 }}>
              <ShieldOutlinedIcon sx={{ fontSize: 14, color: '#10B981' }} />
              {t('client_review.protected_aes_badge')}
            </Typography>
          </Box>
        </Card>
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 4, sm: 8 }, textAlign: 'center' }}>
        <Card elevation={0} sx={{ p: { xs: 3.5, sm: 5 }, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: 'rgba(239, 68, 68, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
            }}
          >
            <ShieldOutlinedIcon sx={{ fontSize: 32, color: '#DC2626' }} />
          </Box>
          <Typography variant="h5" fontWeight={800} color="#0F172A" gutterBottom>
            {t('client_review.proposal_unavailable_title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6 }}>
            {error || t('client_review.proposal_unavailable_desc')}
          </Typography>
          <Alert severity="info" sx={{ my: 3, textAlign: 'left', borderRadius: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={750} gutterBottom>
              {t('common.notice')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.5 }}>
              {t('client_review.investor_protection_note')}
            </Typography>
          </Alert>
          <Button
            variant="contained"
            component={RouterLink}
            to="/dashboard"
            sx={{ fontWeight: 700, borderRadius: 2.5, px: 3, py: 1.2, bgcolor: '#0F172A', '&:hover': { bgcolor: '#1E293B' } }}
          >
            {t('client_review.btn_investor_dashboard')}
          </Button>
        </Card>
      </Container>
    );
  }

  const { mandate, client, ria } = data;
  const isApproved = mandate.status === 'approved' || mandate.status === 'consented';
  const netCapitalGain = (Number(mandate.stcgAmount) || 0) + (Number(mandate.ltcgAmount) || 0);

  // Calculate cutoff window friendly time
  const cutoffTime = mandate.cutoffTimestamp ? new Date(mandate.cutoffTimestamp) : null;
  const now = new Date();
  const diffHours = cutoffTime ? Math.max(0, Math.round((cutoffTime - now) / (1000 * 60 * 60))) : null;

  return (
    <Container
      maxWidth="md"
      sx={{
        py: { xs: 2.5, md: 4 },
        px: { xs: 1.5, sm: 3 },
        width: '100%',
        maxWidth: { xs: '100%', sm: '640px', md: '880px' },
        boxSizing: 'border-box',
      }}
    >
      {/* 1. TRUST HEADER & ADVISER IDENTITY */}
      <Card
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          mb: 3,
          borderRadius: 3.5,
          bgcolor: '#FFFFFF',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Logo size={34} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StatutoryBadge status={mandate.status} />
            {cutoffTime && !isApproved && (
              <Chip
                icon={<AccessTimeOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                label={diffHours !== null ? t('client_review.review_window_left', { hours: diffHours }) : t('client_review.window_active')}
                size="small"
                color={diffHours && diffHours < 12 ? 'warning' : 'default'}
                sx={{ fontWeight: 700, fontSize: '0.72rem' }}
              />
            )}
          </Box>
        </Box>

        <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="overline" color="primary" fontWeight={800} sx={{ letterSpacing: '0.08em' }}>
            {t('client_review.statutory_proposal_badge')}
          </Typography>
          <Typography variant="h5" component="h1" fontWeight={850} color="#0F172A" sx={{ mt: 0.5, lineHeight: 1.3 }}>
            {mandate.title}
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 3 }} sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed #E2E8F0' }}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                {t('client_review.ria_label')}
              </Typography>
              <Typography variant="body2" fontWeight={750} color="#0F172A">
                {ria.firmName} <code style={{ fontSize: '0.8rem', background: '#F1F5F9', padding: '2px 6px', borderRadius: 4 }}>{ria.sebiRegNumber}</code>
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                {t('client_review.client_label')}
              </Typography>
              <Typography variant="body2" fontWeight={750} color="#0F172A">
                {client.name} <code style={{ fontSize: '0.8rem', background: '#F1F5F9', padding: '2px 6px', borderRadius: 4 }}>PAN: {client.maskedPan}</code>
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: 'rgba(2, 132, 199, 0.06)', display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShieldOutlinedIcon sx={{ fontSize: 18, color: '#0284C7' }} />
            <Typography variant="caption" color="#0369A1" fontWeight={650}>
              {t('client_review.investor_protection_note')}
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* 2. QUESTION 1: WHAT IS CHANGING? */}
      <Card elevation={0} sx={{ mb: 3, borderRadius: 3.5, border: '1px solid', borderColor: 'divider', bgcolor: '#FFFFFF' }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#4F46E5', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
              1
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#0F172A">
                {t('client_review.q1_title')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('client_review.q1_subtitle')}
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2.5}>
            {/* Current Allocation */}
            <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
              <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderRadius: 2.5, border: '1px solid', borderColor: '#E2E8F0', height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t('client_review.current_mix_title')}
                  </Typography>
                  <Chip label={t('client_review.current_chip')} size="small" sx={{ fontSize: '0.68rem', height: 20 }} />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600} color="#334155">{t('client_review.equity_exposure')}</Typography>
                      <Typography variant="body2" fontWeight={750} color="#0F172A">{mandate.currentAllocation?.equity || 70}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={mandate.currentAllocation?.equity || 70} color="primary" sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600} color="#334155">{t('client_review.debt_liquid')}</Typography>
                      <Typography variant="body2" fontWeight={750} color="#0F172A">{mandate.currentAllocation?.debt || 20}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={mandate.currentAllocation?.debt || 20} color="secondary" sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Proposed Target Allocation */}
            <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
              <Box sx={{ p: 2.5, bgcolor: 'rgba(16, 185, 129, 0.05)', borderRadius: 2.5, border: '1.5px solid #10B981', height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="caption" fontWeight={800} color="#065F46" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t('client_review.proposed_mix_title')}
                  </Typography>
                  <Chip label={t('client_review.target_chip')} color="success" size="small" sx={{ fontSize: '0.68rem', height: 20, fontWeight: 700 }} />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600} color="#065F46">{t('client_review.equity_exposure')}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" fontWeight={800} color="#065F46">{mandate.proposedAllocation?.equity || 60}%</Typography>
                        <Typography variant="caption" color="text.secondary">({(mandate.proposedAllocation?.equity || 60) - (mandate.currentAllocation?.equity || 70)}%)</Typography>
                      </Box>
                    </Box>
                    <LinearProgress variant="determinate" value={mandate.proposedAllocation?.equity || 60} color="success" sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600} color="#065F46">{t('client_review.debt_liquid')}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" fontWeight={800} color="#065F46">{mandate.proposedAllocation?.debt || 25}%</Typography>
                        <Typography variant="caption" color="success.main">(+{(mandate.proposedAllocation?.debt || 25) - (mandate.currentAllocation?.debt || 20)}%)</Typography>
                      </Box>
                    </Box>
                    <LinearProgress variant="determinate" value={mandate.proposedAllocation?.debt || 25} color="secondary" sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 3. QUESTION 2: WHY IS IT CHANGING? */}
      <Card elevation={0} sx={{ mb: 3, borderRadius: 3.5, border: '1px solid', borderColor: 'divider', bgcolor: '#FFFFFF' }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#4F46E5', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
              2
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#0F172A">
                {t('client_review.q2_title')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('client_review.q2_subtitle')}
              </Typography>
            </Box>
          </Box>

          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <TrendingUpOutlinedIcon color="primary" sx={{ mt: 0.3 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={750} color="#0F172A" gutterBottom>
                  {t('client_review.rationale_heading')}
                </Typography>
                <Typography variant="body2" color="#475569" sx={{ lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                  {mandate.rationale || 'Due to recent market equity appreciation, your equity allocation drifted beyond your intended risk profile. Rebalancing strategically trims high-gain equity positions to lock in capital gains and reallocates capital into high-quality debt & liquid assets. This ensures your portfolio remains aligned with your long-term goals while safeguarding accumulated profits.'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </CardContent>
      </Card>

      {/* 4. QUESTION 3: ESTIMATED TAX IMPACT */}
      <Card elevation={0} sx={{ mb: 3, borderRadius: 3.5, border: '1px solid', borderColor: 'divider', bgcolor: '#FFFFFF' }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#4F46E5', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
              3
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#0F172A">
                {t('client_review.q3_title')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('client_review.q3_subtitle')}
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                  {t('client_review.stcg_title')}
                </Typography>
                <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ my: 0.5 }}>
                  {formatCurrency(Number(mandate.stcgAmount) || 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('client_review.stcg_tax_rate')}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                  {t('client_review.ltcg_title')}
                </Typography>
                <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ my: 0.5 }}>
                  {formatCurrency(Number(mandate.ltcgAmount) || 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('client_review.ltcg_tax_rate')}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
              <Box sx={{ p: 2, bgcolor: 'rgba(79, 70, 229, 0.06)', borderRadius: 2, border: '1.5px solid #6366F1' }}>
                <Typography variant="caption" color="primary.main" fontWeight={750} display="block">
                  {t('client_review.estimated_tax_title')}
                </Typography>
                <Typography variant="h6" fontWeight={850} color="#4F46E5" sx={{ my: 0.5 }}>
                  {formatCurrency(mandate.taxPayable || 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('client_review.precomputed_note')}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Advance Tax Alert if applicable */}
          <AdvanceTaxAlertBanner
            installment={mandate.advanceTaxQuarter || 'Q4'}
            totalTax={mandate.taxPayable}
            netGain={netCapitalGain}
          />
        </CardContent>
      </Card>

      {/* 5. QUESTION 4: WHAT AM I APPROVING? */}
      <Card elevation={0} sx={{ mb: 3, borderRadius: 3.5, border: '1px solid', borderColor: 'divider', bgcolor: '#FFFFFF' }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#4F46E5', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
              4
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#0F172A">
                {t('client_review.q4_title')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('client_review.q4_subtitle')}
              </Typography>
            </Box>
          </Box>

          {/* Plain Language Investor Rights Checklist */}
          <Box sx={{ p: 2, mb: 2.5, borderRadius: 2.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 1.2 }}>
            {[
              t('client_review.chk_authorize_trades'),
              t('client_review.chk_acknowledge_tax', { tax: (mandate.taxPayable || 0).toLocaleString('en-IN') }),
              t('client_review.chk_cutoff_window'),
            ].map((text, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <CheckCircleOutlineIcon color="primary" sx={{ fontSize: 18, mt: 0.2 }} />
                <Typography variant="body2" color="#334155" sx={{ lineHeight: 1.5 }}>
                  {text}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Rebalance Basket Table */}
          {mandate.sellBasket?.length > 0 && (
            <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>{t('client_review.col_security')}</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>{t('client_review.col_units')}</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }} align="right">{t('client_review.col_value')}</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>{t('client_review.col_gain_type')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mandate.sellBasket.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ fontWeight: 650 }}>{item.securityName}</TableCell>
                      <TableCell>{item.units}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {formatCurrency(item.saleValue || 0)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.gainType}
                          size="small"
                          color={item.gainType === 'STCG' ? 'warning' : 'primary'}
                          variant="outlined"
                          sx={{ fontWeight: 700, fontSize: '0.68rem', height: 20 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Mandate-Specific Client/Adviser Chat Section (Placed after disclosures, before Consent) */}
      <MandateChat
        mode="client"
        token={token}
        unlockToken={unlockToken}
        advisorName={ria.name}
        clientName={client.name}
        firmName={ria.firmName}
      />

      {/* 6. QUESTION 5: APPROVE & AUTHORIZE */}
      <Box sx={{ mt: 4, mb: 6, textAlign: 'center' }}>
        {isApproved ? (
          <Card elevation={2} sx={{ p: 4, bgcolor: 'rgba(16, 185, 129, 0.08)', borderColor: 'success.main', border: 1.5, borderRadius: 4 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 52, mb: 1 }} />
            <Typography variant="h5" fontWeight={850} color="success.dark">
              {t('client_review.authorized_locked_title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2.5, maxWidth: 480, mx: 'auto' }}>
              {t('client_review.authorized_locked_desc')}
            </Typography>
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={() => navigate(`/m/${token}/receipt`)}
              sx={{ fontWeight: 750, px: 4, py: 1.3, borderRadius: 2.5 }}
            >
              {t('client_review.btn_view_receipt')}
            </Button>
          </Card>
        ) : (
          <Card elevation={2} sx={{ p: { xs: 3, sm: 4.5 }, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: '#FFFFFF' }}>
            <Typography variant="h5" fontWeight={850} color="#0F172A" gutterBottom>
              {t('client_review.q5_title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 540, mx: 'auto', mb: 3, lineHeight: 1.6 }}>
              {t('client_review.q5_desc', { mobile: client.maskedMobile })}
            </Typography>

            <Button
              id="mandate_authorize_btn"
              variant="contained"
              size="large"
              startIcon={<LockOutlinedIcon />}
              endIcon={<ArrowForwardIcon />}
              onClick={() => setShowOtpModal(true)}
              sx={{
                px: { xs: 3, sm: 5 },
                py: 1.6,
                fontSize: { xs: '0.98rem', sm: '1.05rem' },
                fontWeight: 800,
                borderRadius: 3,
                bgcolor: '#0F172A',
                color: '#FFFFFF',
                '&:hover': { bgcolor: '#1E293B' },
                boxShadow: '0 8px 25px rgba(15, 23, 42, 0.25)',
              }}
            >
              {t('client_review.btn_authorize_otp')}
            </Button>

            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 2 }}>
              {t('client_review.otp_guarantee_text')}
            </Typography>
          </Card>
        )}
      </Box>

      {/* OTP Consent Modal */}
      <OtpModal
        open={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        token={token}
        mandate={mandate}
        maskedMobile={client.maskedMobile}
        unlockToken={unlockToken}
        onVerified={() => {
          setShowOtpModal(false);
          navigate(`/m/${token}/receipt`);
        }}
      />
    </Container>
  );
};

export default ClientReviewPage;
