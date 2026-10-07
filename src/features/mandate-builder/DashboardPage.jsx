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
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StatutoryBadge, ExpirationCountdownBadge } from '../../components/brand/StatutoryBadge.jsx';
import { StatutoryLifecycleGuide } from '../../components/brand/StatutoryLifecycleGuide.jsx';
import { MagicLinkModal } from '../magic-link/MagicLinkModal.jsx';
import { ComplianceDossierModal } from '../compliance-dossier/ComplianceDossierModal.jsx';
import { useAuth } from '../../security/AuthContext.jsx';

export const DashboardPage = () => {
  const queryClient = useQueryClient();
  const { user, role, isGuest, isClient, isComplianceOfficer, isRia, isAdmin } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMandate, setSelectedMandate] = useState(null);
  const [openMagicModal, setOpenMagicModal] = useState(false);
  const [openDossierModal, setOpenDossierModal] = useState(false);
  const [dossierData, setDossierData] = useState(null);
  const navigate = useNavigate();

  const {
    data: mandates = [],
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ['mandates', statusFilter],
    queryFn: async () => {
      const token = localStorage.getItem('finconsent_token');
      const res = await fetch(`/api/mandates?status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch mandates');
      }
      return data.data;
    },
    staleTime: 1000 * 60,
  });

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
  const pendingCount = mandates.filter((m) => m.status === 'sent' || m.status === 'viewed').length;
  const consentedCount = mandates.filter((m) => m.status === 'consented' || m.status === 'approved').length;
  const totalTax = mandates.reduce((sum, m) => sum + (m.taxPayable || 0), 0);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2.5, md: 4 } }}>
      {/* WealthTech Workspace Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={800} letterSpacing="-0.025em" color="#0F172A">
            {isClient
              ? 'My Advisory Portfolios & Consents'
              : isComplianceOfficer
              ? 'Statutory Compliance Audit Center'
              : isGuest
              ? 'FinConsent Workspace Preview'
              : 'Mandate Control Center'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 700 }}>
            {isClient
              ? 'Review proposed portfolio allocations, inspect pre-computed tax obligations, and authorize statutory trade rebalances.'
              : isComplianceOfficer
              ? 'Audit non-discretionary advisory mandates, electronic evidence logs, and Section 65B immutable compliance trails.'
              : isGuest
              ? 'Explore SEBI Regulation 19 compliance workflows. Switch roles or sign in to execute live mandates.'
              : 'Non-discretionary client consent workflows, pre-computed capital gains tax disclosures, and SEBI Regulation 19 compliance receipts.'}
          </Typography>
        </Box>

        {/* Clear Primary Action Button */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {(isRia || isAdmin) && (
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
          )}

          {isComplianceOfficer && (
            <Button
              variant="contained"
              startIcon={<FactCheckOutlinedIcon sx={{ fontSize: 20 }} />}
              component={RouterLink}
              to="/requests"
              sx={{ fontWeight: 700, borderRadius: 2.5, bgcolor: '#0F172A', '&:hover': { bgcolor: '#1E293B' } }}
            >
              Scrutinize Requests Queue
            </Button>
          )}

          {isGuest && (
            <Button
              variant="contained"
              component={RouterLink}
              to="/login"
              sx={{ fontWeight: 700, borderRadius: 2.5, bgcolor: '#0F172A' }}
            >
              Sign In to Practice
            </Button>
          )}
        </Box>
      </Box>

      {/* Institutional WealthTech Metric Summary Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3.5,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 650, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {isClient ? 'Awaiting Your Consent' : isComplianceOfficer ? 'Active Audit Windows' : 'Pending Authorizations'}
              </Typography>
              <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: '#FEF3C7', color: '#D97706', display: 'flex' }}>
                <HourglassEmptyOutlinedIcon sx={{ fontSize: 18 }} />
              </Box>
            </Box>
            <Typography variant="h3" fontWeight={800} color="#0F172A" letterSpacing="-0.03em">
              {pendingCount}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontSize: '0.78rem' }}>
              {isClient ? 'Active mandates requiring your OTP approval' : 'Awaiting investor mobile OTP review within 48h cutoff'}
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3.5,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 650, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {isClient ? 'Consented & Approved' : isComplianceOfficer ? 'Certified Audit Records' : 'Consented Mandates'}
              </Typography>
              <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: '#ECFDF5', color: '#059669', display: 'flex' }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />
              </Box>
            </Box>
            <Typography variant="h3" fontWeight={800} color="#0F172A" letterSpacing="-0.03em">
              {consentedCount}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontSize: '0.78rem' }}>
              {isClient ? 'Approved mandates ready for trade execution' : 'Legally sealed with Regulation 19 audit receipt'}
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3.5,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 650, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {isClient ? 'Total Pre-Computed Tax' : 'Total Capital Gains Tax Impact'}
              </Typography>
              <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: '#EEF2FF', color: '#4F46E5', display: 'flex' }}>
                <CurrencyRupeeIcon sx={{ fontSize: 18 }} />
              </Box>
            </Box>
            <Typography variant="h3" fontWeight={800} color="#0F172A" sx={{ fontFamily: 'JetBrains Mono', letterSpacing: '-0.02em' }}>
              ₹{totalTax.toLocaleString('en-IN')}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontSize: '0.78rem' }}>
              Pre-computed advisory tax liability under Finance Act 2024
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Statutory Lifecycle Rail for Wealth Professionals */}
      {(isRia || isAdmin) && (
        <StatutoryLifecycleGuide overview={true} />
      )}

      {queryError && <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }}>{queryError.message}</Alert>}

      {/* Mandate Ledger Card */}
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
        <Box sx={{ px: 3, pt: 2, borderBottom: '1px solid #F1F5F9' }}>
          <Tabs
            value={statusFilter}
            onChange={(e, val) => setStatusFilter(val)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All Mandates" value="all" />
            <Tab label="Draft" value="draft" />
            <Tab label="Dispatched" value="sent" />
            <Tab label="In Review" value="viewed" />
            <Tab label="Consented" value="consented" />
            <Tab label="Cutoff Expired" value="expired" />
          </Tabs>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  {isClient ? 'Rebalance Proposal' : 'Mandate & Investor Particulars'}
                </TableCell>
                <TableCell>Statutory Status</TableCell>
                <TableCell align="right">Pre-Computed Tax</TableCell>
                <TableCell>48-Hour Cutoff Deadline</TableCell>
                <TableCell align="center">
                  {isClient ? 'Investor Action' : isComplianceOfficer ? 'Statutory Audit Action' : 'Guided Next Action'}
                </TableCell>
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
              ) : mandates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <FolderOpenOutlinedIcon sx={{ fontSize: 40, color: '#94A3B8' }} />
                      <Typography variant="subtitle2" fontWeight={700} color="#334155">
                        No mandates found in this filter view
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {isClient
                          ? 'No rebalance proposals currently assigned to your portfolio.'
                          : 'Draft a new mandate or select another filter view above.'}
                      </Typography>
                      {(isRia || isAdmin) && (
                        <Button
                          variant="outlined"
                          size="small"
                          component={RouterLink}
                          to="/mandates/new"
                          sx={{ mt: 1.5, borderRadius: 2 }}
                        >
                          Draft New Mandate
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                mandates.map((mandate) => (
                  <TableRow key={mandate.id} hover>
                    {/* Column 1: Mandate Title & Client particulars */}
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

                    {/* Column 2: Minimalist WealthTech Status Badge */}
                    <TableCell>
                      <StatutoryBadge status={mandate.status} />
                    </TableCell>

                    {/* Column 3: Tabular Pre-computed Tax */}
                    <TableCell align="right" sx={{ fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#0F172A' }}>
                      ₹{(mandate.taxPayable || 0).toLocaleString('en-IN')}
                    </TableCell>

                    {/* Column 4: 48h Deadline & Countdown */}
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

                    {/* Column 5: Clear Guided Next Action */}
                    <TableCell align="center">
                      {isClient ? (
                        mandate.status === 'sent' || mandate.status === 'viewed' ? (
                          <Button
                            size="small"
                            variant="contained"
                            endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                            component={RouterLink}
                            to={`/m/${mandate.magicToken || 'demo-token'}`}
                            sx={{
                              fontWeight: 700,
                              borderRadius: 2,
                              bgcolor: '#0F172A',
                              '&:hover': { bgcolor: '#1E293B' },
                            }}
                          >
                            Review & Authorize
                          </Button>
                        ) : mandate.status === 'consented' || mandate.status === 'approved' ? (
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            startIcon={<AssignmentTurnedInIcon sx={{ fontSize: 16 }} />}
                            component={RouterLink}
                            to={`/m/${mandate.magicToken || 'demo-token'}/receipt`}
                            sx={{ fontWeight: 650, borderRadius: 2 }}
                          >
                            View Receipt
                          </Button>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            {mandate.status.toUpperCase()}
                          </Typography>
                        )
                      ) : isComplianceOfficer ? (
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Button
                            size="small"
                            variant="outlined"
                            component={RouterLink}
                            to={`/mandates/${mandate.id}`}
                            sx={{ borderRadius: 2, fontSize: '0.78rem' }}
                          >
                            Audit Trail
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ReceiptLongOutlinedIcon sx={{ fontSize: 16 }} />}
                            onClick={() => handleOpenDossier(mandate)}
                            sx={{ borderRadius: 2, fontSize: '0.78rem' }}
                          >
                            Dossier
                          </Button>
                        </Stack>
                      ) : (
                        // RIA / Admin Guided Actions
                        mandate.status === 'draft' ? (
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
                        )
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

export default DashboardPage;
