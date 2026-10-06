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
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import { StatutoryBadge } from '../../components/brand/StatutoryBadge.jsx';
import { TaxBreakdownCard } from '../tax-engine/index.js';
import { AuditTrailTimeline } from '../audit-trail/index.js';
import { MagicLinkModal } from '../magic-link/MagicLinkModal.jsx';
import { ComplianceDossierModal } from '../compliance-dossier/ComplianceDossierModal.jsx';
import { useAuth } from '../../security/AuthContext.jsx';

export const MandateDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [mandate, setMandate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openMagicModal, setOpenMagicModal] = useState(false);
  const [openDossierModal, setOpenDossierModal] = useState(false);
  const [dispatching, setDispatching] = useState(false);

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

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3 }}>
        <Button
          component={RouterLink}
          to="/dashboard"
          startIcon={<ArrowBackOutlinedIcon />}
          size="small"
        >
          Back to Control Center
        </Button>
      </Box>

      {/* Header Card */}
      <Card elevation={2} sx={{ p: 4, mb: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h5" component="h1" fontWeight={700}>
                {mandate.title}
              </Typography>
              <StatutoryBadge status={mandate.status} />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Client: <strong>{mandate.client?.name}</strong> (PAN: <code>{mandate.client?.pan}</code>) | Mobile: {mandate.client?.mobile}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              Cutoff Window: <strong>{new Date(mandate.cutoffTimestamp).toLocaleString('en-IN')}</strong>
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
              >
                {dispatching ? 'Dispatching...' : 'Dispatch Mandate Link'}
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<ShareOutlinedIcon />}
                onClick={() => setOpenMagicModal(true)}
              >
                Share Magic Link
              </Button>
            )}

            <Button
              variant="outlined"
              color="secondary"
              startIcon={<ReceiptLongOutlinedIcon />}
              onClick={() => setOpenDossierModal(true)}
            >
              Regulation 19 Dossier
            </Button>
          </Box>
        </Box>
      </Card>

      <Grid container spacing={3}>
        {/* Tax Breakdown */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TaxBreakdownCard
              stcgAmount={mandate.stcgAmount}
              ltcgAmount={mandate.ltcgAmount}
            />

            <Card elevation={2} sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Client Review URL
              </Typography>
              <Typography variant="caption" sx={{ wordBreak: 'break-all', display: 'block', mb: 2, fontFamily: 'JetBrains Mono' }}>
                {window.location.origin}/m/{mandate.magicToken}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                component={RouterLink}
                to={`/m/${mandate.magicToken}`}
                target="_blank"
              >
                Preview Client Mobile View
              </Button>
            </Card>
          </Box>
        </Grid>

        {/* Audit Trail Timeline */}
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
