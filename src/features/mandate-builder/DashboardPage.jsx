import React, { useState, useEffect } from 'react';
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
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { StatutoryBadge, ExpirationCountdownBadge } from '../../components/brand/StatutoryBadge.jsx';
import { MagicLinkModal } from '../magic-link/MagicLinkModal.jsx';
import { ComplianceDossierModal } from '../compliance-dossier/ComplianceDossierModal.jsx';

export const DashboardPage = () => {
  const [mandates, setMandates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMandate, setSelectedMandate] = useState(null);
  const [openMagicModal, setOpenMagicModal] = useState(false);
  const [openDossierModal, setOpenDossierModal] = useState(false);
  const [dossierData, setDossierData] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchMandates = async () => {
    try {
      const token = localStorage.getItem('finconsent_token');
      const res = await fetch(`/api/mandates?status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMandates(data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMandates();
  }, [statusFilter]);

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
      console.error(err);
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
      setSelectedMandate(result.data);
      fetchMandates();
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700}>
            Mandate Control Center
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Statutory trade rebalancing authorizations & SEBI Regulation 19 compliance dossiers
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          component={RouterLink}
          to="/mandates/new"
        >
          Draft Rebalance Mandate
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

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
                <TableCell sx={{ fontWeight: 700 }}>Mandate Title</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Live Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Pre-computed Tax (₹)</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>48-Hour Cutoff & Countdown</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
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
                    No mandates found in this view. Click "Draft Rebalance Mandate" to create one.
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
                    <TableCell align="center">
                      <Box sx={{ display: 'inline-flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ShareOutlinedIcon />}
                          onClick={() => handleOpenMagicLink(mandate)}
                        >
                          Magic Link
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="secondary"
                          startIcon={<ReceiptLongOutlinedIcon />}
                          onClick={() => handleOpenDossier(mandate)}
                        >
                          Dossier
                        </Button>
                      </Box>
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
