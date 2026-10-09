import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { StatutoryBadge } from '../../components/brand/StatutoryBadge.jsx';
import { ComplianceDossierModal } from '../compliance-dossier/ComplianceDossierModal.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { formatCurrency } from '../../i18n/formatters.js';

export const ComplianceDashboard = ({ user, mandates = [], loading = false, error = null }) => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMandate, setSelectedMandate] = useState(null);
  const [dossierData, setDossierData] = useState(null);
  const [openDossierModal, setOpenDossierModal] = useState(false);
  const [loadingDossier, setLoadingDossier] = useState(false);

  const filteredMandates = statusFilter === 'all'
    ? mandates
    : mandates.filter((m) => m.status === statusFilter);

  const verifiedCount = mandates.filter((m) => m.status === 'consented' || m.status === 'approved').length;
  const pendingCount = mandates.filter((m) => m.status === 'sent' || m.status === 'viewed').length;
  const totalTaxCalculated = mandates.reduce((sum, m) => sum + (m.taxPayable || 0), 0);

  const handleOpenDossier = async (mandate) => {
    setSelectedMandate(mandate);
    setLoadingDossier(true);
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
    } finally {
      setLoadingDossier(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2.5, md: 4 } }}>
      {/* 1. Header with Regulatory Status */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.8 }}>
            <Typography variant="h4" component="h1" fontWeight={800} letterSpacing="-0.025em" color="#0F172A">
              {t('dashboard.comp_title')}
            </Typography>
            <Chip
              label={t('dashboard.comp_badge')}
              size="small"
              sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: 'rgba(2, 132, 199, 0.1)', color: '#0369A1', border: '1px solid rgba(2, 132, 199, 0.25)' }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 760 }}>
            {t('dashboard.comp_desc')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="contained"
            startIcon={<FactCheckOutlinedIcon sx={{ fontSize: 18 }} />}
            component={RouterLink}
            to="/requests"
            sx={{
              fontWeight: 700,
              borderRadius: 2.5,
              px: 2.5,
              py: 1,
              bgcolor: '#0F172A',
              color: '#FFFFFF',
              '&:hover': { bgcolor: '#1E293B' },
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
            }}
          >
            {t('dashboard.comp_btn_requests')}
          </Button>

          <Button
            variant="outlined"
            startIcon={<PeopleAltOutlinedIcon sx={{ fontSize: 18 }} />}
            component={RouterLink}
            to="/clients"
            sx={{
              fontWeight: 650,
              borderRadius: 2.5,
              borderColor: '#CBD5E1',
              color: '#0F172A',
              '&:hover': { borderColor: '#0F172A', bgcolor: '#F8FAFC' },
            }}
          >
            {t('dashboard.comp_btn_clients')}
          </Button>
        </Box>
      </Box>

      {/* 2. Regulatory Integrity & Audit KPIs */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {t('dashboard.comp_stat_verified')}
              </Typography>
              <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: '#ECFDF5', color: '#059669', display: 'flex' }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />
              </Box>
            </Box>
            <Typography variant="h3" fontWeight={850} color="#0F172A" letterSpacing="-0.03em">
              {verifiedCount}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {t('dashboard.comp_stat_verified_sub')}
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {t('dashboard.comp_stat_surveillance')}
              </Typography>
              <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex' }}>
                <FingerprintIcon sx={{ fontSize: 18 }} />
              </Box>
            </Box>
            <Typography variant="h3" fontWeight={850} color="#0F172A" letterSpacing="-0.03em">
              {pendingCount}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {t('dashboard.comp_stat_surveillance_sub')}
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {t('dashboard.comp_stat_tax')}
              </Typography>
              <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: '#F5F3FF', color: '#7C3AED', display: 'flex' }}>
                <CloudDoneOutlinedIcon sx={{ fontSize: 18 }} />
              </Box>
            </Box>
            <Typography variant="h3" fontWeight={850} color="#0F172A" sx={{ fontFamily: 'JetBrains Mono' }}>
              {formatCurrency(totalTaxCalculated)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {t('dashboard.comp_stat_tax_sub')}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* 3. Tamper-Evident System Integrity Banner */}
      <Card elevation={0} sx={{ p: 2.5, mb: 3.5, borderRadius: 3, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <FingerprintIcon sx={{ color: '#0F172A', fontSize: 28 }} />
            <Box>
              <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                {t('dashboard.comp_hash_title')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('dashboard.comp_hash_desc')}
              </Typography>
            </Box>
          </Box>

          <Chip
            label={t('dashboard.comp_hash_badge')}
            size="small"
            sx={{ fontWeight: 800, bgcolor: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }}
          />
        </Box>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* 4. Complete Mandates Audit Ledger */}
      <Card elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Box>
            <Typography variant="h6" fontWeight={800} color="#0F172A">
              {t('dashboard.comp_register_title', { count: filteredMandates.length })}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('dashboard.comp_register_desc')}
            </Typography>
          </Box>

          <Tabs
            value={statusFilter}
            onChange={(e, val) => setStatusFilter(val)}
            sx={{
              minHeight: 36,
              '& .MuiTab-root': {
                minHeight: 36,
                py: 0.5,
                px: 1.8,
                fontSize: '0.82rem',
                fontWeight: 650,
                textTransform: 'none',
              },
            }}
          >
            <Tab label={t('dashboard.comp_tab_all')} value="all" />
            <Tab label={t('dashboard.comp_tab_consented')} value="consented" />
            <Tab label={t('dashboard.comp_tab_active')} value="sent" />
            <Tab label={t('dashboard.comp_tab_drafts')} value="draft" />
            <Tab label={t('dashboard.comp_tab_expired')} value="expired" />
          </Tabs>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{t('dashboard.comp_th_mandate')}</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{t('dashboard.comp_th_firm')}</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{t('dashboard.comp_th_tax')}</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{t('dashboard.comp_th_status')}</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }} align="center">{t('dashboard.comp_th_dossier')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : filteredMandates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    {t('dashboard.comp_no_records')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMandates.map((m) => (
                  <TableRow key={m.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={750} color="#0F172A">
                        {m.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Client: <strong>{m.clientName}</strong> (PAN: {m.clientPan || 'Verified'})
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={650}>
                        {m.riaFirmName || 'Advisory Firm'}
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'JetBrains Mono', color: 'text.secondary' }}>
                        {m.riaSebiReg || 'INA000088921'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={750} color="#4F46E5">
                        {formatCurrency(m.taxPayable || 0)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        STCG: {formatCurrency(m.stcgAmount || 0)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <StatutoryBadge status={m.status} />
                    </TableCell>

                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<FolderOpenOutlinedIcon sx={{ fontSize: 16 }} />}
                        onClick={() => handleOpenDossier(m)}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 650,
                          fontSize: '0.78rem',
                          borderColor: '#CBD5E1',
                          color: '#0F172A',
                          '&:hover': { borderColor: '#0F172A', bgcolor: '#F8FAFC' },
                        }}
                      >
                        {t('dashboard.comp_btn_scrutinize')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Compliance Dossier Modal for Section 65B Inspection & PDF Export */}
      <ComplianceDossierModal
        open={openDossierModal}
        onClose={() => setOpenDossierModal(false)}
        mandate={dossierData?.mandate || selectedMandate}
        client={dossierData?.client}
        ria={dossierData?.ria}
        auditLogs={dossierData?.auditLogs || []}
      />
    </Container>
  );
};

export default ComplianceDashboard;
