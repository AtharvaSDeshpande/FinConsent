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
import { useI18n } from '../../i18n/I18nContext.jsx';

export const RiaDashboard = ({ user, mandates = [], loading = false, error = null }) => {
  const { t, formatCurrency } = useI18n();
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
            <Typography variant="h4" component="h1" fontWeight={800} letterSpacing="-0.025em" color="#0F172A" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              {user?.firmName || 'Prudent Wealth Advisory'}
            </Typography>
            <Chip
              label={user?.sebiRegNumber ? `SEBI: ${user.sebiRegNumber}` : 'INA000088921 (Active)'}
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
          <Typography variant="subtitle2" color="primary.main" fontWeight={700} sx={{ mb: 0.5 }}>
            {user?.name ? t('dashboard.ria_registered_title', { name: user.name }) : t('dashboard.ria_title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 740 }}>
            {t('dashboard.ria_subtitle')}
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
            {t('dashboard.client_dir_btn')}
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
            {t('dashboard.draft_mandate_btn')}
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
                {t('dashboard.urgent_action_title', { count: urgentMandates.length })}
              </Typography>
              <Typography variant="caption" color="#B45309">
                {t('dashboard.urgent_action_desc')}
              </Typography>
            </Box>
            <Button
              size="small"
              variant="contained"
              color="warning"
              onClick={() => handleOpenMagicLink(urgentMandates[0])}
              sx={{ fontWeight: 700, borderRadius: 2, fontSize: '0.75rem' }}
            >
              {t('dashboard.reshare_urgent_btn')}
            </Button>
          </Box>
        </Alert>
      )}

      {/* 3. Metric Summary Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={3} size={{ xs: 12, sm: 6, md: 3 }}>
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
                {t('dashboard.stat_pending_title')}
              </Typography>
              <Box sx={{ p: 0.7, borderRadius: 1.5, bgcolor: '#FEF3C7', color: '#D97706', display: 'flex' }}>
                <HourglassEmptyOutlinedIcon sx={{ fontSize: 16 }} />
              </Box>
            </Box>
            <Typography variant="h3" fontWeight={800} color="#0F172A" letterSpacing="-0.03em">
              {pendingMandates.length}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontSize: '0.75rem' }}>
              {urgentMandates.length > 0 ? t('dashboard.stat_pending_sub_urgent', { count: urgentMandates.length }) : t('dashboard.stat_pending_sub_normal')}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3} size={{ xs: 12, sm: 6, md: 3 }}>
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
                {t('dashboard.stat_consented_title')}
              </Typography>
              <Box sx={{ p: 0.7, borderRadius: 1.5, bgcolor: '#ECFDF5', color: '#059669', display: 'flex' }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
              </Box>
            </Box>
            <Typography variant="h3" fontWeight={800} color="#0F172A" letterSpacing="-0.03em">
              {consentedMandates.length}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontSize: '0.75rem' }}>
              {t('dashboard.stat_consented_sub')}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3} size={{ xs: 12, sm: 6, md: 3 }}>
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
                {t('dashboard.stat_tax_title')}
              </Typography>
              <Box sx={{ p: 0.7, borderRadius: 1.5, bgcolor: '#EEF2FF', color: '#4F46E5', display: 'flex' }}>
                <CurrencyRupeeIcon sx={{ fontSize: 16 }} />
              </Box>
            </Box>
            <Typography variant="h3" fontWeight={800} color="#0F172A" sx={{ letterSpacing: '-0.025em' }}>
              {formatCurrency(totalTax)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontSize: '0.75rem' }}>
              {t('dashboard.stat_tax_sub')}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3} size={{ xs: 12, sm: 6, md: 3 }}>
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
                {t('dashboard.stat_quota_title')}
              </Typography>
              <Chip label={t('dashboard.stat_quota_badge')} size="small" sx={{ height: 20, fontSize: '0.68rem', bgcolor: '#ECFDF5', color: '#047857', fontWeight: 700 }} />
            </Box>
            <Box sx={{ my: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">{t('dashboard.stat_quota_cap')}</Typography>
                <Typography variant="caption" fontWeight={700}>{mandates.length}/500</Typography>
              </Box>
              <LinearProgress variant="determinate" value={Math.min(100, (mandates.length / 500) * 100)} sx={{ height: 6, borderRadius: 3 }} />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.75rem' }}>
              {t('dashboard.stat_quota_sub')}
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
            <Tab label={t('dashboard.tab_all', { count: mandates.length })} value="all" />
            <Tab label={t('dashboard.tab_drafts', { count: draftMandates.length })} value="draft" />
            <Tab label={t('dashboard.tab_sent', { count: mandates.filter((m) => m.status === 'sent').length })} value="sent" />
            <Tab label={t('dashboard.tab_viewed', { count: mandates.filter((m) => m.status === 'viewed').length })} value="viewed" />
            <Tab label={t('dashboard.tab_consented', { count: consentedMandates.length })} value="consented" />
            <Tab label={t('dashboard.tab_expired', { count: mandates.filter((m) => m.status === 'expired').length })} value="expired" />
          </Tabs>

          <Button
            size="small"
            component={RouterLink}
            to="/mandates/new"
            startIcon={<AddCircleOutlineIcon sx={{ fontSize: 16 }} />}
            sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
          >
            {t('nav.new_mandate')}
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('dashboard.th_mandate_client')}</TableCell>
                <TableCell>{t('dashboard.th_status')}</TableCell>
                <TableCell align="right">{t('dashboard.th_tax')}</TableCell>
                <TableCell>{t('dashboard.th_cutoff')}</TableCell>
                <TableCell align="center">{t('dashboard.th_action')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={28} sx={{ color: '#0F172A' }} />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                      {t('dashboard.loading_mandates')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredMandates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <FolderOpenOutlinedIcon sx={{ fontSize: 40, color: '#94A3B8' }} />
                      <Typography variant="subtitle2" fontWeight={700} color="#334155">
                        {t('dashboard.no_mandates_found')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('dashboard.no_mandates_hint')}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        component={RouterLink}
                        to="/mandates/new"
                        sx={{ mt: 1.5, borderRadius: 2 }}
                      >
                        {t('dashboard.draft_mandate_btn')}
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
                              fontWeight: 650,
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
                      {formatCurrency(mandate.taxPayable || 0)}
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
                          {t('dashboard.btn_review_dispatch')}
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
                            {t('dashboard.btn_share_link')}
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleOpenDossier(mandate)}
                            sx={{ borderRadius: 2, fontSize: '0.75rem' }}
                          >
                            {t('dashboard.btn_dossier')}
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
                            {t('dashboard.btn_remind_client')}
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleOpenDossier(mandate)}
                            sx={{ borderRadius: 2, fontSize: '0.75rem' }}
                          >
                            {t('dashboard.btn_dossier')}
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
                          {t('dashboard.btn_reg19_receipt')}
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
                          {t('dashboard.btn_redraft')}
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
