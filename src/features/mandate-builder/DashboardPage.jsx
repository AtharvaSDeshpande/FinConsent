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
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StatutoryBadge, ExpirationCountdownBadge } from '../../components/brand/StatutoryBadge.jsx';
import { StatutoryLifecycleGuide } from '../../components/brand/StatutoryLifecycleGuide.jsx';
import { MagicLinkModal } from '../magic-link/MagicLinkModal.jsx';
import { ComplianceDossierModal } from '../compliance-dossier/ComplianceDossierModal.jsx';
import { useAuth } from '../../security/AuthContext.jsx';

export const DashboardPage = () => {
  const queryClient = useQueryClient();
  const { user, role, isGuest, isClient, isComplianceOfficer, isRia, isAdmin, switchPersona } = useAuth();
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

  // Role-specific metrics calculations
  const pendingCount = mandates.filter((m) => m.status === 'sent' || m.status === 'viewed').length;
  const consentedCount = mandates.filter((m) => m.status === 'consented').length;
  const totalTax = mandates.reduce((sum, m) => sum + (m.taxPayable || 0), 0);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Role-tailored Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h4" component="h1" fontWeight={800} letterSpacing="-0.02em">
              {isClient
                ? 'My Advisory Portfolio & Authorizations'
                : isComplianceOfficer
                ? 'Statutory Compliance Audit Center'
                : isGuest
                ? 'FinConsent Workspace Preview'
                : 'Mandate Control Center'}
            </Typography>
            <Chip
              label={`ROLE: ${role?.toUpperCase() || 'GUEST'}`}
              color={role === 'admin' ? 'secondary' : role === 'compliance_officer' ? 'info' : role === 'client' ? 'success' : 'primary'}
              size="small"
              sx={{ fontWeight: 800 }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {isClient
              ? 'Inspect and grant statutory trade rebalance consent per SEBI (Investment Advisers) Regulations, 2013'
              : isComplianceOfficer
              ? 'Audit non-discretionary advisory mandates, Section 65B electronic evidence, and SHA-256 chained logs'
              : isGuest
              ? 'Explore SEBI Regulation 19 compliance workflows. Switch roles or sign in to execute live actions.'
              : 'Statutory trade rebalancing authorizations & SEBI Regulation 19 compliance dossiers'}
          </Typography>
        </Box>

        {/* Action Button strictly tailored to authorized roles */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {(isRia || isAdmin) && (
            <Button
              variant="contained"
              startIcon={<AddCircleOutlineIcon />}
              component={RouterLink}
              to="/mandates/new"
              sx={{
                fontWeight: 700,
                borderRadius: 2.5,
                background: 'linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)',
              }}
            >
              Draft Rebalance Mandate
            </Button>
          )}

          {isComplianceOfficer && (
            <Button
              variant="contained"
              color="info"
              startIcon={<FactCheckOutlinedIcon />}
              component={RouterLink}
              to="/requests"
              sx={{ fontWeight: 700, borderRadius: 2.5 }}
            >
              Scrutinize Requests Queue
            </Button>
          )}

          {isGuest && (
            <Button
              variant="contained"
              component={RouterLink}
              to="/login"
              sx={{ fontWeight: 700, borderRadius: 2.5 }}
            >
              Sign In to Practice
            </Button>
          )}
        </Box>
      </Box>

      {/* Role-Specific Metric Summary Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={1} sx={{ p: 2.5, borderRadius: 3, border: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: isClient ? 'warning.light' : 'primary.light', color: 'white' }}>
                <HourglassEmptyIcon />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {isClient ? 'Awaiting Your Consent' : isComplianceOfficer ? 'Active Audit Windows' : 'Pending Authorizations'}
                </Typography>
                <Typography variant="h5" fontWeight={800}>
                  {pendingCount}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={1} sx={{ p: 2.5, borderRadius: 3, border: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'success.main', color: 'white' }}>
                <CheckCircleIcon />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {isClient ? 'Consented & Approved' : isComplianceOfficer ? 'Certified Compliance Records' : 'Consented Mandates'}
                </Typography>
                <Typography variant="h5" fontWeight={800}>
                  {consentedCount}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={1} sx={{ p: 2.5, borderRadius: 3, border: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'info.main', color: 'white' }}>
                <VerifiedUserOutlinedIcon />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {isClient ? 'Total Pre-Computed Tax' : 'Total Capital Gains Tax Impact'}
                </Typography>
                <Typography variant="h5" fontWeight={800} sx={{ fontFamily: 'JetBrains Mono' }}>
                  ₹{totalTax.toLocaleString('en-IN')}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Statutory Lifecycle Rail for RIAs & Admins */}
      {(isRia || isAdmin) && (
        <StatutoryLifecycleGuide overview={true} />
      )}

      {queryError && <Alert severity="error" sx={{ mb: 3 }}>{queryError.message}</Alert>}

      {/* Mandate Ledger Card */}
      <Card elevation={2} sx={{ borderRadius: 3, border: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={statusFilter}
          onChange={(e, val) => setStatusFilter(val)}
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Mandates" value="all" sx={{ fontWeight: 600 }} />
          <Tab label="Draft" value="draft" sx={{ fontWeight: 600 }} />
          <Tab label="Sent" value="sent" sx={{ fontWeight: 600 }} />
          <Tab label="Viewed" value="viewed" sx={{ fontWeight: 600 }} />
          <Tab label="Consented" value="consented" sx={{ fontWeight: 600 }} />
          <Tab label="Expired" value="expired" sx={{ fontWeight: 600 }} />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>
                  {isClient ? 'Rebalance Proposal' : 'Mandate Title & ID'}
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Statutory Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Pre-computed Tax (₹)</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>48-Hour Cutoff & Countdown</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  {isClient ? 'Investor Action' : isComplianceOfficer ? 'Statutory Audit Action' : 'Guided Next Action'}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : mandates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    {isClient
                      ? 'No rebalance proposals currently assigned to your portfolio in this view.'
                      : 'No mandates found in this filter view.'}
                  </TableCell>
                </TableRow>
              ) : (
                mandates.map((mandate) => (
                  <TableRow key={mandate.id} hover>
                    <TableCell>
                      <Typography
                        component={RouterLink}
                        to={`/mandates/${mandate.id}`}
                        variant="body2"
                        fontWeight={700}
                        sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                      >
                        {mandate.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        ID: {mandate.id}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <StatutoryBadge status={mandate.status} />
                    </TableCell>

                    <TableCell align="right" sx={{ fontWeight: 700, fontFamily: 'JetBrains Mono' }}>
                      ₹{(mandate.taxPayable || 0).toLocaleString('en-IN')}
                    </TableCell>

                    <TableCell sx={{ fontSize: '0.82rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                        <span>
                          {mandate.cutoffTimestamp
                            ? new Date(mandate.cutoffTimestamp).toLocaleString('en-IN', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })
                            : '—'}
                        </span>
                        <ExpirationCountdownBadge
                          cutoffTimestamp={mandate.cutoffTimestamp}
                          status={mandate.status}
                        />
                      </Box>
                    </TableCell>

                    {/* Role-Tailored Action Column */}
                    <TableCell align="center">
                      {isClient ? (
                        // Client Actions
                        mandate.status === 'sent' || mandate.status === 'viewed' ? (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            endIcon={<ArrowForwardIcon />}
                            component={RouterLink}
                            to={`/m/${mandate.magicToken || 'demo-token'}`}
                            sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
                          >
                            Review & Authorize
                          </Button>
                        ) : mandate.status === 'consented' ? (
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            startIcon={<AssignmentTurnedInIcon />}
                            component={RouterLink}
                            to={`/m/${mandate.magicToken || 'demo-token'}/receipt`}
                            sx={{ fontWeight: 600, borderRadius: 2, textTransform: 'none' }}
                          >
                            Receipt
                          </Button>
                        ) : (
                          <Chip label={mandate.status.toUpperCase()} size="small" variant="outlined" />
                        )
                      ) : isComplianceOfficer ? (
                        // Compliance Officer Actions
                        <Box sx={{ display: 'inline-flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            component={RouterLink}
                            to={`/mandates/${mandate.id}`}
                            sx={{ textTransform: 'none', borderRadius: 2 }}
                          >
                            Audit Trail
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            startIcon={<ReceiptLongOutlinedIcon />}
                            onClick={() => handleOpenDossier(mandate)}
                            sx={{ textTransform: 'none', borderRadius: 2 }}
                          >
                            Dossier
                          </Button>
                        </Box>
                      ) : (
                        // RIA / Admin Guided Next Actions
                        mandate.status === 'draft' ? (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            component={RouterLink}
                            to={`/mandates/${mandate.id}`}
                            endIcon={<ArrowForwardIcon />}
                            sx={{
                              fontWeight: 700,
                              borderRadius: 2,
                              textTransform: 'none',
                              background: 'linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)',
                            }}
                          >
                            Review & Dispatch
                          </Button>
                        ) : mandate.status === 'sent' ? (
                          <Box sx={{ display: 'inline-flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="warning"
                              startIcon={<ShareOutlinedIcon />}
                              onClick={() => handleOpenMagicLink(mandate)}
                              sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
                            >
                              Share Link
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="secondary"
                              startIcon={<ReceiptLongOutlinedIcon />}
                              onClick={() => handleOpenDossier(mandate)}
                              sx={{ textTransform: 'none', borderRadius: 2 }}
                            >
                              Dossier
                            </Button>
                          </Box>
                        ) : mandate.status === 'viewed' ? (
                          <Box sx={{ display: 'inline-flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              startIcon={<ShareOutlinedIcon />}
                              onClick={() => handleOpenMagicLink(mandate)}
                              sx={{ fontWeight: 600, borderRadius: 2, textTransform: 'none' }}
                            >
                              Remind Client
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="secondary"
                              startIcon={<ReceiptLongOutlinedIcon />}
                              onClick={() => handleOpenDossier(mandate)}
                              sx={{ textTransform: 'none', borderRadius: 2 }}
                            >
                              Dossier
                            </Button>
                          </Box>
                        ) : mandate.status === 'consented' ? (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<ReceiptLongOutlinedIcon />}
                            onClick={() => handleOpenDossier(mandate)}
                            sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
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
                            sx={{ fontWeight: 600, borderRadius: 2, textTransform: 'none' }}
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
