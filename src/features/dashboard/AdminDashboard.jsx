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
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { StatutoryBadge } from '../../components/brand/StatutoryBadge.jsx';
import { ComplianceDossierModal } from '../compliance-dossier/ComplianceDossierModal.jsx';

export const AdminDashboard = ({ user, mandates = [], loading = false, error = null }) => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMandate, setSelectedMandate] = useState(null);
  const [dossierData, setDossierData] = useState(null);
  const [openDossierModal, setOpenDossierModal] = useState(false);

  const filteredMandates = statusFilter === 'all'
    ? mandates
    : mandates.filter((m) => m.status === statusFilter);

  const totalMandates = mandates.length;
  const consentedMandates = mandates.filter((m) => m.status === 'consented' || m.status === 'approved').length;
  const pendingMandates = mandates.filter((m) => m.status === 'sent' || m.status === 'viewed').length;

  const handleOpenDossier = async (mandate) => {
    setSelectedMandate(mandate);
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

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2.5, md: 4 } }}>
      {/* 1. Header with Admin Role Pill */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.8 }}>
            <Typography variant="h4" component="h1" fontWeight={800} letterSpacing="-0.025em" color="#0F172A">
              Platform Administration & Governance
            </Typography>
            <Chip
              label="SUPERUSER ROOT CONSOLE"
              size="small"
              sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: '#F1F5F9', color: '#0F172A', border: '1px solid #CBD5E1' }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 760 }}>
            Global platform telemetry, advisory practice management, statutory quota controls, and cross-firm audit oversight.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            component={RouterLink}
            to="/clients"
            startIcon={<PeopleAltOutlinedIcon sx={{ fontSize: 18 }} />}
            sx={{ fontWeight: 700, borderRadius: 2.5, px: 2.5, py: 1, bgcolor: '#0F172A', color: '#FFFFFF', '&:hover': { bgcolor: '#1E293B' } }}
          >
            Client Directory
          </Button>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/requests"
            startIcon={<AssignmentOutlinedIcon sx={{ fontSize: 18 }} />}
            sx={{ fontWeight: 650, borderRadius: 2.5, borderColor: '#CBD5E1', color: '#0F172A', '&:hover': { borderColor: '#0F172A', bgcolor: '#F8FAFC' } }}
          >
            Advisory Requests
          </Button>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/settings/billing"
            startIcon={<PaymentOutlinedIcon sx={{ fontSize: 18 }} />}
            sx={{ fontWeight: 650, borderRadius: 2.5, borderColor: '#CBD5E1', color: '#0F172A', '&:hover': { borderColor: '#0F172A', bgcolor: '#F8FAFC' } }}
          >
            Subscription Billing
          </Button>
        </Box>
      </Box>

      {/* 2. Platform Telemetry Metrics */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={3} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', height: '100%' }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Total Rebalance Mandates
            </Typography>
            <Typography variant="h3" fontWeight={850} color="#0F172A" letterSpacing="-0.03em" sx={{ mt: 1 }}>
              {totalMandates}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Platform-wide mandate volume
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', height: '100%' }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Consented & Locked
            </Typography>
            <Typography variant="h3" fontWeight={850} color="#059669" letterSpacing="-0.03em" sx={{ mt: 1 }}>
              {consentedMandates}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Verified with 6-digit Mobile OTP
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', height: '100%' }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Surveillance Windows
            </Typography>
            <Typography variant="h3" fontWeight={850} color="#D97706" letterSpacing="-0.03em" sx={{ mt: 1 }}>
              {pendingMandates}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Currently in 48-hour client review
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', height: '100%' }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Infrastructure Status
            </Typography>
            <Typography variant="h5" fontWeight={850} color="#0F172A" sx={{ mt: 1.5 }}>
              Active / Healthy
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              MongoDB Atlas • ap-south-1 (Mumbai)
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* 3. Global Mandate Ledger */}
      <Card elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Box>
            <Typography variant="h6" fontWeight={800} color="#0F172A">
              Global Mandates Register ({filteredMandates.length})
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Platform-wide cross-adviser mandate ledger with full audit access
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
            <Tab label="All" value="all" />
            <Tab label="Consented" value="consented" />
            <Tab label="Sent / In Review" value="sent" />
            <Tab label="Draft" value="draft" />
            <Tab label="Expired" value="expired" />
          </Tabs>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Proposal Title & Client</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Adviser Firm & Reg</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Pre-Computed Tax</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }} align="center">Actions</TableCell>
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
                    No mandates found.
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
                        Client: <strong>{m.clientName}</strong> (PAN: {m.clientPan || 'N/A'})
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={650}>
                        {m.riaFirmName || 'Adviser Firm'}
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'JetBrains Mono', color: 'text.secondary' }}>
                        {m.riaSebiReg}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={750} color="#4F46E5">
                        ₹{(m.taxPayable || 0).toLocaleString('en-IN')}
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
                        Audit Dossier
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

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

export default AdminDashboard;
