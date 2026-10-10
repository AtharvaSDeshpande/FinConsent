import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import { StatutoryBadge } from '../../components/brand/StatutoryBadge.jsx';
import { StatutoryLifecycleGuide } from '../../components/brand/StatutoryLifecycleGuide.jsx';
import { TaxBreakdownCard } from '../tax-engine/index.js';
import { AuditTrailTimeline } from '../audit-trail/index.js';
import { MagicLinkModal } from '../magic-link/MagicLinkModal.jsx';
import { ComplianceDossierModal } from '../compliance-dossier/ComplianceDossierModal.jsx';
import { MandateChat } from '../chat/MandateChat.jsx';
import { useAuth } from '../../security/AuthContext.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

export const MandateDetailPage = () => {
  const { t } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role, isClient } = useAuth();
  const [mandate, setMandate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openMagicModal, setOpenMagicModal] = useState(false);
  const [openDossierModal, setOpenDossierModal] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchMandate = async () => {
    try {
      const token = localStorage.getItem('finconsent_token');
      const res = await fetch(`/api/mandates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch mandate');
      }
      setMandate(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMandate();
  }, [id]);

  useEffect(() => {
    if (mandate && isClient && mandate.magicToken) {
      if (mandate.status === 'consented' || mandate.status === 'approved') {
        navigate(`/m/${mandate.magicToken}/receipt`, { replace: true });
      } else {
        navigate(`/m/${mandate.magicToken}`, { replace: true });
      }
    }
  }, [mandate, isClient, navigate]);

  const handleDispatch = async () => {
    setDispatching(true);
    try {
      const token = localStorage.getItem('finconsent_token');
      const res = await fetch(`/api/mandates/${id}/dispatch`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        console.log('======================================================');
        console.log('>>> [MANDATE DISPATCHED - FOR TESTING PURPOSE] <<<');
        console.log('Mandate:', data.data);
        console.log('Client Password:', data.data?.password || data.data?.clientPassword);
        console.log('Magic Link URL:', `${window.location.origin}/m/${data.data?.magicToken}`);
        console.log('======================================================');

        if (data.data) {
          setMandate((prev) => ({
            ...prev,
            ...data.data,
            password: data.data.password || data.data.clientPassword || prev?.password,
            clientPassword: data.data.clientPassword || data.data.password || prev?.clientPassword,
            client: prev?.client || data.data.client,
            ria: prev?.ria || data.data.ria,
            auditLogs: prev?.auditLogs || data.data.auditLogs,
          }));
        }
        await fetchMandate();
        setOpenMagicModal(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setDispatching(false);
    }
  };

  const handleRevokeMandate = async () => {
    if (!window.confirm('Are you sure you want to revoke this mandate? This will invalidate the client access link and log a statutory revocation audit event.')) return;
    setRevoking(true);
    try {
      const token = localStorage.getItem('finconsent_token');
      const res = await fetch(`/api/mandates/${id}/revoke`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        await fetchMandate();
      } else {
        setError(data.error || 'Failed to revoke mandate');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setRevoking(false);
    }
  };

  const handleRevoke = async (mandateId) => {
    const token = localStorage.getItem('finconsent_token');
    const res = await fetch(`/api/mandates/${mandateId}/revoke-link`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    if (result.success) {
      if (result.data) {
        setMandate((prev) => ({
          ...prev,
          ...result.data,
          client: prev?.client || result.data.client,
          ria: prev?.ria || result.data.ria,
          auditLogs: prev?.auditLogs || result.data.auditLogs,
        }));
      }
      await fetchMandate();
    }
  };

  const handleCopyLink = () => {
    if (!mandate?.magicToken) return;
    const url = `${window.location.origin}/m/${mandate.magicToken}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWhatsAppShare = () => {
    if (!mandate?.magicToken) return;
    const url = `${window.location.origin}/m/${mandate.magicToken}`;
    const text = encodeURIComponent(
      `Hi ${mandate.client?.name || 'Client'}, please review and authorize your quarterly portfolio rebalancing proposal per SEBI Regulation 19: ${url}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: 2 }}>
        <CircularProgress size={32} sx={{ color: '#0F172A' }} />
        <Typography variant="caption" color="text.secondary">
          {t('mandate.loading_dossier')}
        </Typography>
      </Box>
    );
  }

  if (error || !mandate) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
        <Box sx={{ mb: 3 }}>
          <Button
            component={RouterLink}
            to="/dashboard"
            startIcon={<ArrowBackOutlinedIcon sx={{ fontSize: 18 }} />}
            size="small"
            sx={{ textTransform: 'none', fontWeight: 600, color: '#64748B', '&:hover': { color: '#0F172A' } }}
          >
            {t('mandate.back_to_control')}
          </Button>
        </Box>

        <Card
          elevation={0}
          sx={{
            p: { xs: 3.5, sm: 5 },
            borderRadius: 4,
            border: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: error?.toLowerCase().includes('unauthorized') ? 'rgba(239, 68, 68, 0.08)' : '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
            }}
          >
            <LockOutlinedIcon
              sx={{
                fontSize: 28,
                color: error?.toLowerCase().includes('unauthorized') ? '#DC2626' : '#64748B',
              }}
            />
          </Box>

          <Typography variant="h5" fontWeight={800} color="#0F172A" gutterBottom>
            {error?.toLowerCase().includes('unauthorized')
              ? t('mandate.restricted_title')
              : t('mandate.not_found_title')}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 540, mx: 'auto', mb: 3, lineHeight: 1.6 }}>
            {error || t('mandate.restricted_desc')}
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
            <Button
              variant="contained"
              component={RouterLink}
              to="/dashboard"
              sx={{
                fontWeight: 700,
                borderRadius: 2.5,
                px: 3,
                py: 1,
                bgcolor: '#0F172A',
                '&:hover': { bgcolor: '#1E293B' },
              }}
            >
              {t('mandate.btn_return_control')}
            </Button>
            <Button
              variant="outlined"
              component={RouterLink}
              to="/mandates/new"
              sx={{ fontWeight: 650, borderRadius: 2.5, borderColor: '#CBD5E1', color: '#334155' }}
            >
              {t('dashboard.draft_mandate_btn')}
            </Button>
          </Stack>
        </Card>
      </Container>
    );
  }

  const clientMagicUrl = mandate?.magicToken
    ? `${window.location.origin}/m/${mandate.magicToken}`
    : '';

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2.5, md: 4 } }}>
      <Box sx={{ mb: 2.5 }}>
        <Button
          component={RouterLink}
          to="/dashboard"
          startIcon={<ArrowBackOutlinedIcon sx={{ fontSize: 18 }} />}
          size="small"
          sx={{ textTransform: 'none', fontWeight: 600, color: '#64748B', '&:hover': { color: '#0F172A' } }}
        >
          {t('mandate.back_to_control')}
        </Button>
      </Box>

      {/* Institutional Wealth Management Mandate Header */}
      <Card
        elevation={0}
        sx={{
          p: { xs: 3, md: 3.5 },
          mb: 3,
          borderRadius: 3.5,
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2.5 }}>
          <Box sx={{ maxWidth: { xs: '100%', md: '68%' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
              <Typography variant="h4" component="h1" fontWeight={800} letterSpacing="-0.02em" color="#0F172A">
                {mandate.title}
              </Typography>
              <StatutoryBadge status={mandate.status} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                {t('mandate.client_label')}: <strong style={{ color: '#0F172A' }}>{mandate.client?.name}</strong>
              </Typography>
              {mandate.client?.pan && (
                <Box
                  component="span"
                  sx={{
                    px: 0.8,
                    py: 0.2,
                    borderRadius: '4px',
                    bgcolor: '#F1F5F9',
                    color: '#475569',
                    fontSize: '0.72rem',
                    fontFamily: 'JetBrains Mono',
                    fontWeight: 650,
                  }}
                >
                  {t('mandate.pan_label')}: {mandate.client.pan}
                </Box>
              )}
              <Typography variant="caption" color="text.secondary">
                {t('mandate.mobile_label')}: {mandate.client?.mobile}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.8 }}>
              {t('mandate.cutoff_deadline')}: <strong style={{ color: '#334155' }}>{new Date(mandate.cutoffTimestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</strong>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {isClient ? (
              mandate.magicToken && (
                <Button
                  variant="contained"
                  component={RouterLink}
                  to={mandate.status === 'consented' || mandate.status === 'approved' ? `/m/${mandate.magicToken}/receipt` : `/m/${mandate.magicToken}`}
                  sx={{
                    fontWeight: 700,
                    borderRadius: 2.5,
                    bgcolor: '#0F172A',
                    '&:hover': { bgcolor: '#1E293B' },
                  }}
                >
                  {mandate.status === 'consented' || mandate.status === 'approved' ? t('dashboard.client_th_receipt') : t('dashboard.client_btn_review_auth')}
                </Button>
              )
            ) : role === 'compliance_officer' ? (
              <Box
                sx={{
                  px: 1.5,
                  py: 0.8,
                  borderRadius: 2,
                  bgcolor: 'rgba(2, 132, 199, 0.08)',
                  color: '#0369A1',
                  border: '1px solid rgba(2, 132, 199, 0.25)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                {t('mandate.comp_mode_badge')}
              </Box>
            ) : mandate.status === 'draft' ? (
              <Button
                variant="contained"
                startIcon={<SendOutlinedIcon sx={{ fontSize: 18 }} />}
                onClick={handleDispatch}
                disabled={dispatching}
                sx={{
                  fontWeight: 700,
                  borderRadius: 2.5,
                  bgcolor: '#0F172A',
                  '&:hover': { bgcolor: '#1E293B' },
                }}
              >
                {dispatching ? t('mandate.dispatching') : t('mandate.btn_dispatch_link')}
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<ShareOutlinedIcon sx={{ fontSize: 18 }} />}
                onClick={() => setOpenMagicModal(true)}
                sx={{
                  fontWeight: 700,
                  borderRadius: 2.5,
                  bgcolor: '#0F172A',
                  '&:hover': { bgcolor: '#1E293B' },
                }}
              >
                {t('mandate.btn_share_magic')}
              </Button>
            )}

            <Button
              variant="outlined"
              startIcon={<ReceiptLongOutlinedIcon sx={{ fontSize: 18 }} />}
              onClick={() => setOpenDossierModal(true)}
              sx={{ fontWeight: 650, borderRadius: 2.5 }}
            >
              {t('mandate.btn_reg19_dossier')}
            </Button>

            {!isClient && (role === 'ria' || role === 'admin') && mandate.status !== 'consented' && mandate.status !== 'approved' && mandate.status !== 'revoked' && mandate.status !== 'expired' && (
              <Button
                variant="outlined"
                color="error"
                onClick={handleRevokeMandate}
                disabled={revoking}
                sx={{ fontWeight: 650, borderRadius: 2.5 }}
              >
                {revoking ? 'Revoking...' : 'Revoke Mandate'}
              </Button>
            )}
          </Box>
        </Box>
      </Card>

      {/* Guided Statutory Lifecycle Tracker */}
      <StatutoryLifecycleGuide
        status={mandate.status}
        onDispatch={handleDispatch}
        onShare={() => setOpenMagicModal(true)}
        onViewDossier={() => setOpenDossierModal(true)}
        dispatching={dispatching}
      />

      <Grid container spacing={3}>
        {/* Left Column: Pre-computed Tax Impact & Client Review Hub */}
        <Grid item xs={12} md={5} size={{ xs: 12, md: 5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TaxBreakdownCard
              stcgAmount={mandate.stcgAmount}
              ltcgAmount={mandate.ltcgAmount}
            />

            {/* Client Mobile Portal Dispatch Card */}
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3.5,
                border: '1px solid #E2E8F0',
                bgcolor: '#FFFFFF',
              }}
            >
              <Typography variant="subtitle1" fontWeight={750} color="#0F172A" gutterBottom>
                {t('mandate.client_rail_title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem', mb: 2 }}>
                {t('mandate.client_rail_desc')}
              </Typography>

              <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0', mb: 2 }}>
                <Typography variant="caption" sx={{ wordBreak: 'break-all', display: 'block', fontFamily: 'JetBrains Mono', color: clientMagicUrl ? '#334155' : '#94A3B8', fontSize: '0.78rem' }}>
                  {clientMagicUrl || (mandate.status === 'draft' ? t('mandate.draft_proposal_notice') : t('mandate.generating_link'))}
                </Typography>
              </Box>

              {!isClient && (mandate.password || mandate.clientPassword) && (
                <Box sx={{ p: 1.5, mb: 2.5, bgcolor: '#FFFBEB', borderRadius: 2, border: '1px dashed #F59E0B' }}>
                  <Typography variant="caption" sx={{ fontWeight: 750, color: '#B45309', display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {t('mandate.testing_password_badge')}
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'JetBrains Mono', fontWeight: 800, color: '#92400E', my: 0.5, letterSpacing: 1.5 }}>
                    {mandate.password || mandate.clientPassword}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#78350F', display: 'block', fontSize: '0.75rem' }}>
                    {t('mandate.password_helper_pan', { pan: mandate.client?.pan ? String(mandate.client.pan).replace(/\D/g, '').slice(-4) : '****' })}
                  </Typography>
                </Box>
              )}

              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant={copiedLink ? 'contained' : 'outlined'}
                    color={copiedLink ? 'success' : 'inherit'}
                    size="small"
                    startIcon={copiedLink ? <CheckIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
                    onClick={handleCopyLink}
                    disabled={!mandate?.magicToken}
                    fullWidth
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                  >
                    {copiedLink ? t('mandate.btn_link_copied') : t('mandate.btn_copy_link')}
                  </Button>
                  <Button
                    variant="outlined"
                    color="success"
                    size="small"
                    startIcon={<WhatsAppIcon sx={{ fontSize: 16 }} />}
                    onClick={handleWhatsAppShare}
                    disabled={!mandate?.magicToken}
                    fullWidth
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                  >
                    {t('mandate.btn_whatsapp')}
                  </Button>
                </Box>

                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  component={mandate?.magicToken ? RouterLink : 'button'}
                  to={mandate?.magicToken ? `/m/${mandate.magicToken}` : undefined}
                  disabled={!mandate?.magicToken}
                  target="_blank"
                  endIcon={<OpenInNewIcon sx={{ fontSize: 15 }} />}
                  sx={{ textTransform: 'none', fontWeight: 650, borderRadius: 2 }}
                >
                  {t('mandate.btn_preview_mobile')}
                </Button>
              </Stack>

              <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px dashed #E2E8F0', display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoOutlinedIcon sx={{ fontSize: 16, color: '#64748B' }} />
                <Typography variant="caption" color="text.secondary">
                  {t('mandate.otp_required_notice')}
                </Typography>
              </Box>
            </Card>
          </Box>
        </Grid>

        {/* Right Column: Statutory Rationale & Activity / Audit Trail */}
        <Grid item xs={12} md={7} size={{ xs: 12, md: 7 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {mandate.rationale && (
              <Card elevation={0} sx={{ p: 3, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <TrendingUpOutlinedIcon color="primary" sx={{ fontSize: 22 }} />
                  <Typography variant="subtitle1" fontWeight={750} color="#0F172A">
                    {t('mandate.adviser_rationale_title')}
                  </Typography>
                </Box>
                <Typography variant="body2" color="#475569" sx={{ lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                  {mandate.rationale}
                </Typography>
              </Card>
            )}
            {/* Mandate-Scoped Client-Advisor Chat Communication */}
            <MandateChat
              mode="advisor"
              mandateId={mandate.id}
              advisorName={user?.name || 'Investment Adviser'}
              clientName={mandate?.client?.name || 'Client'}
              firmName={mandate?.ria?.firmName || user?.firmName || 'Advisory Practice'}
            />

            <AuditTrailTimeline logs={mandate.auditLogs || []} />
          </Box>
        </Grid>
      </Grid>

      {/* Magic Link Modal */}
      <MagicLinkModal
        open={openMagicModal}
        onClose={() => setOpenMagicModal(false)}
        mandate={mandate}
        onRevokeAndRegenerate={handleRevoke}
      />

      {/* Compliance Dossier Modal */}
      <ComplianceDossierModal
        open={openDossierModal}
        onClose={() => setOpenDossierModal(false)}
        mandate={mandate}
        client={mandate.client}
        ria={user}
        auditLogs={mandate.auditLogs || []}
      />
    </Container>
  );
};

export default MandateDetailPage;
