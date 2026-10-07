import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import { Link as RouterLink } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { StatutoryBadge, ExpirationCountdownBadge } from '../../components/brand/StatutoryBadge.jsx';
import { StatutoryLifecycleGuide } from '../../components/brand/StatutoryLifecycleGuide.jsx';
import { MagicLinkModal } from '../magic-link/MagicLinkModal.jsx';
import { ComplianceDossierModal } from '../compliance-dossier/ComplianceDossierModal.jsx';

export const RiaDashboard = ({ user, mandates = [], loading = false, error = null }) => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMandate, setSelectedMandate] = useState(null);
  const [openMagicModal, setOpenMagicModal] = useState(false);
  const [openDossierModal, setOpenDossierModal] = useState(false);
  const [dossierData, setDossierData] = useState(null);

  const handleOpenMagicLink = (mandate) => {
    setSelectedMandate(mandate);
    setOpenMagicModal(true);
  };

  const handleOpenDossier = async (mandate) => {
    try {
      const token = localStorage.getItem('finconsent_token');
      const res = await fetch(`/api/mandates/${mandate.id}/dossier`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setDossierData(result.data);
        setOpenDossierModal(true);
      }
    } catch (err) {
      console.error('[Dossier Error]:', err);
    }
  };

  const revokeMutation = useMutation({
    mutationFn: async (mandateId) => {
      const token = localStorage.getItem('finconsent_token');
      const res = await fetch(`/api/mandates/${mandateId}/revoke-link`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to revoke magic link');
      }
      return result.data;
    },
    onSuccess: (updatedMandate) => {
      setSelectedMandate(updatedMandate);
      queryClient.invalidateQueries({ queryKey: ['mandates'] });
    },
  });

  const handleRevoke = (mandateId) => {
    revokeMutation.mutate(mandateId);
  };

  // Metrics calculations
  const pendingMandates = mandates.filter((m) => m.status === 'sent' || m.status === 'viewed');
  const consentedMandates = mandates.filter((m) => m.status === 'consented' || m.status === 'approved');
  const draftMandates = mandates.filter((m) => m.status === 'draft');
  const totalTax = mandates.reduce((sum, m) => sum + (m.taxPayable || 0), 0);

  // Urgent attention: mandates expiring in less than 24 hours
  const urgentMandates = pendingMandates.filter((m) => {
    if (!m.cutoffTimestamp) return false;
    const diff = new Date(m.cutoffTimestamp) - new Date();
    return diff > 0 && diff < 24 * 60 * 60 * 1000;
  });

  const filteredMandates = statusFilter === 'all'
    ? mandates
    : mandates.filter((m) => m.status === statusFilter);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2.5, md: 4 } }}>
      {/* 1. Header & Primary Action */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h4" component="h1" fontWeight={800} letterSpacing="-0.025em" color="#0F172A">
              Adviser Execution Workspace
            </Typography>
            <Chip
              label={user?.sebiRegNumber ? `SEBI: ${user.sebiRegNumber}` : 'INA000012345 (Active)'}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.75rem',
                bgcolor: '#EFF6FF',
                color: '#1D4ED8',
                border: '1px solid #BFDBFE',
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 740 }}>
            Prepare non-discretionary portfolio rebalances, preview capital gains tax impacts under Finance Act 2024,
            and monitor statutory 48-hour client authorization windows.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<PeopleAltOutlinedIcon sx={{ fontSize: 18 }} />}
            component={RouterLink}
            to="/clients"
            sx={{ fontWeight: 650, borderRadius: 2.5, borderColor: '#CBD5E1', color: '#334155' }}
          >
            Client Directory
          </Button>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon sx={{ fontSize: 20 }} />}
            component={RouterLink}
            to="/mandates/new"
            sx={{
              fontWeight: 700,
              borderRadius: 2.5,
              px: 2.5,
              py: 1,
              bgcolor: '#0F172A',
              '&:hover': { bgcolor: '#1E293B' },
            }}
          >
            Draft Rebalance Mandate
          </Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }}>{error}</Alert>}

      {/* 2. Priority Attention Banner if urgent mandates exist */}
      {urgentMandates.length > 0 && (
        <Alert
          severity="warning"
          icon={<NotificationsActiveOutlinedIcon sx={{ color: '#D97706' }} />}
          sx={{
            mb: 3.5,
            borderRadius: 3,
            bgcolor: '#FFFBEB',
            border: '1px solid #FDE68A',
            '& .MuiAlert-message': { width: '100%' },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography variant="subtitle2" fontWeight={800} color="#92400E">
                Action Required: {urgentMandates.length} Mandate{urgentMandates.length > 1 ? 's' : ''} Expiring in &lt; 24 Hours
              </Typography>
              <Typography variant="caption" color="#B45309">
                Investors have not yet submitted mobile OTP consent. Remind them or reshare their access link before the statutory 48-hour cutoff.
              </Typography>
            </Box>
            <Button
              size="small"
              variant="contained"
              color="warning"
              onClick={() => handleOpenMagicLink(urgentMandates[0])}
              sx={{ fontWeight: 700, borderRadius: 2, fontSize: '0.75rem' }}
            >
              Reshare Most Urgent Link
            </Button>
          </Box>
        </Alert>
      )}

      {/* 3. Metric Summary Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 650, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Pending Client Authorizations
              </Typography>
              <Box sx={{ p: 0.7, borderRadius: 1.5, bgcolor: '#FEF3C7', color: '#D97706', display: 'flex' }}>
                <HourglassEmptyOutlinedIcon sx={{ fontSize: 16 }} />
              </Box>
            </Box>
            <Typography variant="h3" fontWeight={800} color="#0F172A" letterSpacing="-0.03em">
              {pendingMandates.length}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontSize: '0.75rem' }}>
              {urgentMandates.length > 0 ? `${urgentMandates.length} nearing 48h cutoff` : 'All within active window'}
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 650, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Consented & Certified
              </Typography>
              <Box sx={{ p: 0.7, borderRadius: 1.5, bgcolor: '#ECFDF5', color: '#059669', display: 'flex' }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
              </Box>
            </Box>
            <Typography variant="h3" fontWeight={800} color="#0F172A" letterSpacing="-0.03em">
              {consentedMandates.length}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontSize: '0.75rem' }}>
              Legally sealed with Reg. 19 receipt
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 650, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Tax Impact Assessed
              </Typography>
              <Box sx={{ p: 0.7, borderRadius: 1.5, bgcolor: '#EEF2FF', color: '#4F46E5', display: 'flex' }}>
                <CurrencyRupeeIcon sx={{ fontSize: 16 }} />
              </Box>
            </Box>
            <Typography variant="h3" fontWeight={800} color="#0F172A" sx={{ fontFamily: 'JetBrains Mono', letterSpacing: '-0.02em' }}>
              ₹{totalTax.toLocaleString('en-IN')}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontSize: '0.75rem' }}>
              Finance Act 2024 pre-computed tax
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 650, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Firm Quota & Health
              </Typography>
              <Chip label="Healthy" size="small" sx={{ height: 20, fontSize: '0.68rem', bgcolor: '#ECFDF5', color: '#047857', fontWeight: 700 }} />
            </Box>
            <Box sx={{ my: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">Monthly Capacity</Typography>
                <Typography variant="caption" fontWeight={700}>{mandates.length}/500</Typography>
              </Box>
              <LinearProgress variant="determinate" value={Math.min(100, (mandates.length / 500) * 100)} sx={{ height: 6, borderRadius: 3 }} />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.75rem' }}>
              Non-discretionary audit trail online
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* 4. Statutory Lifecycle Flow for Wealth Professionals */}
      <StatutoryLifecycleGuide overview={true} />

      {/* 5. Mandate Ledger Table */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3.5,
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          mb: 4,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ px: 3, pt: 2, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Tabs
            value={statusFilter}
            onChange={(e, val) => setStatusFilter(val)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={`All (${mandates.length})`} value="all" />
            <Tab label={`Drafts (${draftMandates.length})`} value="draft" />
            <Tab label={`Dispatched (${mandates.filter((m) => m.status === 'sent').length})`} value="sent" />
            <Tab label={`In Review (${mandates.filter((m) => m.status === 'viewed').length})`} value="viewed" />
            <Tab label={`Consented (${consentedMandates.length})`} value="consented" />
            <Tab label="Expired" value="expired" />
          </Tabs>

          <Button
            size="small"
            component={RouterLink}
            to="/mandates/new"
            startIcon={<AddCircleOutlineIcon sx={{ fontSize: 16 }} />}
            sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
          >
            New Mandate
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mandate & Investor Particulars</TableCell>
                <TableCell>Statutory Status</TableCell>
                <TableCell align="right">Pre-Computed Tax</TableCell>
                <TableCell>48-Hour Cutoff Deadline</TableCell>
                <TableCell align="center">Guided Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={28} sx={{ color: '#0F172A' }} />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                      Loading verified portfolio mandates...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredMandates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <FolderOpenOutlinedIcon sx={{ fontSize: 40, color: '#94A3B8' }} />
                      <Typography variant="subtitle2" fontWeight={700} color="#334155">
                        No mandates found in this filter view
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Draft a new rebalance mandate or select another filter view above.
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        component={RouterLink}
                        to="/mandates/new"
                        sx={{ mt: 1.5, borderRadius: 2 }}
                      >
                        Draft New Mandate
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMandates.map((mandate) => (
                  <TableRow key={mandate.id} hover>
                    <TableCell>
                      <Typography
                        component={RouterLink}
                        to={`/mandates/${mandate.id}`}
                        variant="body2"
                        fontWeight={700}
                        sx={{
                          color: '#0F172A',
                          textDecoration: 'none',
                          '&:hover': { color: '#4F46E5', textDecoration: 'underline' },
                          display: 'block',
                        }}
                      >
                        {mandate.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.4 }}>
                        <Typography variant="caption" color="text.secondary">
                          {mandate.client?.name ? `Client: ${mandate.client.name}` : `ID: ${mandate.id}`}
                        </Typography>
                        {mandate.client?.pan && (
                          <Box
                            component="span"
                            sx={{
                              px: 0.7,
                              py: 0.1,
                              borderRadius: '4px',
                              bgcolor: '#F1F5F9',
                              color: '#475569',
                              fontSize: '0.68rem',
                              fontFamily: 'JetBrains Mono',
                              fontWeight: 600,
                            }}
                          >
                            {mandate.client.pan}
                          </Box>
                        )}
                      </Box>
                    </TableCell>

                    <TableCell>
                      <StatutoryBadge status={mandate.status} />
                    </TableCell>

                    <TableCell align="right" sx={{ fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#0F172A' }}>
                      ₹{(mandate.taxPayable || 0).toLocaleString('en-IN')}
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                        <Typography variant="caption" color="#475569" fontWeight={550}>
                          {mandate.cutoffTimestamp
                            ? new Date(mandate.cutoffTimestamp).toLocaleString('en-IN', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })
                            : '—'}
                        </Typography>
                        <ExpirationCountdownBadge
                          cutoffTimestamp={mandate.cutoffTimestamp}
                          status={mandate.status}
                        />
                      </Box>
                    </TableCell>

                    <TableCell align="center">
                      {mandate.status === 'draft' ? (
                        <Button
                          size="small"
                          variant="contained"
                          component={RouterLink}
                          to={`/mandates/${mandate.id}`}
                          endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                          sx={{
                            fontWeight: 700,
                            borderRadius: 2,
                            bgcolor: '#0F172A',
                            '&:hover': { bgcolor: '#1E293B' },
                          }}
                        >
                          Review & Dispatch
                        </Button>
                      ) : mandate.status === 'sent' ? (
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Button
                            size="small"
                            variant="contained"
                            color="warning"
                            startIcon={<ShareOutlinedIcon sx={{ fontSize: 15 }} />}
                            onClick={() => handleOpenMagicLink(mandate)}
                            sx={{ fontWeight: 700, borderRadius: 2 }}
                          >
                            Share Link
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleOpenDossier(mandate)}
                            sx={{ borderRadius: 2, fontSize: '0.75rem' }}
                          >
                            Dossier
                          </Button>
                        </Stack>
                      ) : mandate.status === 'viewed' ? (
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            startIcon={<ShareOutlinedIcon sx={{ fontSize: 15 }} />}
                            onClick={() => handleOpenMagicLink(mandate)}
                            sx={{ fontWeight: 650, borderRadius: 2 }}
                          >
                            Remind Client
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleOpenDossier(mandate)}
                            sx={{ borderRadius: 2, fontSize: '0.75rem' }}
                          >
                            Dossier
                          </Button>
                        </Stack>
                      ) : mandate.status === 'consented' || mandate.status === 'approved' ? (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<ReceiptLongOutlinedIcon sx={{ fontSize: 16 }} />}
                          onClick={() => handleOpenDossier(mandate)}
                          sx={{ fontWeight: 700, borderRadius: 2 }}
                        >
                          Reg. 19 Receipt
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          component={RouterLink}
                          to="/mandates/new"
                          sx={{ fontWeight: 650, borderRadius: 2 }}
                        >
                          Re-draft
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Magic Link Sharing Modal */}
      <MagicLinkModal
        open={openMagicModal}
        onClose={() => setOpenMagicModal(false)}
        mandate={selectedMandate}
        onRevokeAndRegenerate={handleRevoke}
      />

      {/* Regulation 19 Compliance Dossier Modal */}
      {dossierData && (
        <ComplianceDossierModal
          open={openDossierModal}
          onClose={() => setOpenDossierModal(false)}
          mandate={dossierData.mandate}
          client={dossierData.client}
          ria={dossierData.ria}
          auditLogs={dossierData.auditLogs}
        />
      )}
    </Container>
  );
};

export default RiaDashboard;
