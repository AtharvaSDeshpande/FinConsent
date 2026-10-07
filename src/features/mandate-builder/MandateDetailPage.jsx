import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
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
import { StatutoryBadge } from '../../components/brand/StatutoryBadge.jsx';
import { StatutoryLifecycleGuide } from '../../components/brand/StatutoryLifecycleGuide.jsx';
import { TaxBreakdownCard } from '../tax-engine/index.js';
import { AuditTrailTimeline } from '../audit-trail/index.js';
import { MagicLinkModal } from '../magic-link/MagicLinkModal.jsx';
import { ComplianceDossierModal } from '../compliance-dossier/ComplianceDossierModal.jsx';
import { useAuth } from '../../security/AuthContext.jsx';

export const MandateDetailPage = () => {
  const { id } = useParams();
  const { user, role } = useAuth();
  const [mandate, setMandate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openMagicModal, setOpenMagicModal] = useState(false);
  const [openDossierModal, setOpenDossierModal] = useState(false);
  const [dispatching, setDispatching] = useState(false);
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
        fetchMandate();
        setOpenMagicModal(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setDispatching(false);
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
      fetchMandate();
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !mandate) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Mandate not found'}</Alert>
      </Container>
    );
  }

  const clientMagicUrl = `${window.location.origin}/m/${mandate.magicToken}`;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ mb: 2.5 }}>
        <Button
          component={RouterLink}
          to="/dashboard"
          startIcon={<ArrowBackOutlinedIcon />}
          size="small"
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Back to Control Center
        </Button>
      </Box>

      {/* Header Card */}
      <Card elevation={2} sx={{ p: { xs: 2.5, sm: 3.5 }, mb: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ maxWidth: { xs: '100%', md: '65%' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
              <Typography variant="h5" component="h1" fontWeight={800} letterSpacing="-0.01em">
                {mandate.title}
              </Typography>
              <StatutoryBadge status={mandate.status} />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Client: <strong>{mandate.client?.name}</strong> | PAN: <code>{mandate.client?.pan}</code> | Mobile: {mandate.client?.mobile}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              48-Hour Cutoff Deadline: <strong>{new Date(mandate.cutoffTimestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</strong>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {role === 'compliance_officer' ? (
              <Chip
                label="Compliance Audit Mode (Read-Only)"
                color="info"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
            ) : mandate.status === 'draft' ? (
              <Button
                variant="contained"
                startIcon={<SendOutlinedIcon />}
                onClick={handleDispatch}
                disabled={dispatching}
                sx={{
                  fontWeight: 700,
                  borderRadius: 2.5,
                  background: 'linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)',
                }}
              >
                {dispatching ? 'Dispatching...' : 'Dispatch Mandate Link'}
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<ShareOutlinedIcon />}
                onClick={() => setOpenMagicModal(true)}
                sx={{ fontWeight: 700, borderRadius: 2.5 }}
              >
                Share Magic Link
              </Button>
            )}

            <Button
              variant="outlined"
              color="secondary"
              startIcon={<ReceiptLongOutlinedIcon />}
              onClick={() => setOpenDossierModal(true)}
              sx={{ fontWeight: 600, borderRadius: 2.5 }}
            >
              Regulation 19 Dossier
            </Button>
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
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TaxBreakdownCard
              stcgAmount={mandate.stcgAmount}
              ltcgAmount={mandate.ltcgAmount}
            />

            {/* Client Mobile Portal Dispatch Card */}
            <Card elevation={2} sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                Client Mobile Review Rail
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem', mb: 2 }}>
                Investor receives a tokenized, mobile-first view answering 5 plain-English questions with zero jargon.
              </Typography>

              <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0', mb: 2 }}>
                <Typography variant="caption" sx={{ wordBreak: 'break-all', display: 'block', fontFamily: 'JetBrains Mono', color: '#334155', fontSize: '0.78rem' }}>
                  {clientMagicUrl}
                </Typography>
              </Box>

              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant={copiedLink ? 'contained' : 'outlined'}
                    color={copiedLink ? 'success' : 'primary'}
                    size="small"
                    startIcon={copiedLink ? <CheckIcon /> : <ContentCopyIcon />}
                    onClick={handleCopyLink}
                    fullWidth
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                  >
                    {copiedLink ? 'Link Copied!' : 'Copy Proposal Link'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="success"
                    size="small"
                    startIcon={<WhatsAppIcon />}
                    onClick={handleWhatsAppShare}
                    fullWidth
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                  >
                    WhatsApp Client
                  </Button>
                </Box>

                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  component={RouterLink}
                  to={`/m/${mandate.magicToken}`}
                  target="_blank"
                  endIcon={<OpenInNewIcon sx={{ fontSize: '16px !important' }} />}
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                >
                  Preview Client Mobile View
                </Button>
              </Stack>

              <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed #E2E8F0', display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  Mobile OTP authorization is required before this link reaches the 48h cutoff.
                </Typography>
              </Box>
            </Card>
          </Box>
        </Grid>

        {/* Right Column: Statutory Activity & Section 65B Audit Trail */}
        <Grid size={{ xs: 12, md: 7 }}>
          <AuditTrailTimeline logs={mandate.auditLogs || []} />
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
