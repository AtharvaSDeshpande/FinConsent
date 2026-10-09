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
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import { Link as RouterLink } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../security/AuthContext.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { formatNumber } from '../../i18n/formatters.js';

export const ClientsPage = () => {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const [modalError, setModalError] = useState('');
  const [newClient, setNewClient] = useState({
    name: '',
    pan: '',
    mobile: '',
    email: '',
    portfolioValue: '',
  });

  // TanStack Query for caching and server state
  const {
    data: clients = [],
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const token = localStorage.getItem('finconsent_token');
      const res = await fetch('/api/clients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch clients');
      }
      return data.data;
    },
    staleTime: 1000 * 60 * 3, // 3 minutes cache
  });

  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = clients.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.pan?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.mobile?.includes(q)
    );
  });

  // TanStack Mutation with Optimistic UI Update
  const createClientMutation = useMutation({
    mutationFn: async (clientPayload) => {
      const token = localStorage.getItem('finconsent_token');
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(clientPayload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create client');
      }
      return data.data;
    },
    onMutate: async (newClientData) => {
      await queryClient.cancelQueries({ queryKey: ['clients'] });
      const previousClients = queryClient.getQueryData(['clients']) || [];
      const optimisticClient = {
        id: `temp-${Date.now()}`,
        ...newClientData,
        portfolioValue: Number(newClientData.portfolioValue || 0),
        isOptimistic: true,
      };
      queryClient.setQueryData(['clients'], [optimisticClient, ...previousClients]);
      return { previousClients };
    },
    onError: (err, newClientData, context) => {
      if (context?.previousClients) {
        queryClient.setQueryData(['clients'], context.previousClients);
      }
      setModalError(err.message || 'Failed to create client');
    },
    onSuccess: () => {
      setOpenModal(false);
      setNewClient({ name: '', pan: '', mobile: '', email: '', portfolioValue: '' });
      setModalError('');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setModalError('');

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/i;
    if (!panRegex.test(newClient.pan.trim())) {
      setModalError('Invalid Indian PAN. Format: ABCDE1234F (10 characters)');
      return;
    }

    const mobileClean = newClient.mobile.replace(/\D/g, '');
    if (mobileClean.length !== 10 || !/^[6-9]/.test(mobileClean)) {
      setModalError('Invalid Indian Mobile. Must be 10 digits starting with 6-9');
      return;
    }

    createClientMutation.mutate(newClient);
  };

  const { isRia, isAdmin, isComplianceOfficer } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h4" component="h1" fontWeight={800} letterSpacing="-0.02em">
              {t('clients.title')}
            </Typography>
            {isComplianceOfficer && (
              <Chip label={t('clients.audit_badge')} size="small" color="info" sx={{ fontWeight: 700 }} />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {isComplianceOfficer
              ? t('clients.subtitle_comp')
              : t('clients.subtitle_ria')}
          </Typography>
        </Box>

        {(isRia || isAdmin) && (
          <Button
            variant="contained"
            startIcon={<PersonAddAltOutlinedIcon />}
            onClick={() => setOpenModal(true)}
            sx={{
              fontWeight: 700,
              borderRadius: 2.5,
              py: 1.2,
              px: 2.5,
              bgcolor: '#0F172A',
              color: '#FFFFFF',
              '&:hover': { bgcolor: '#1E293B' },
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
            }}
          >
            {t('clients.btn_add_client')}
          </Button>
        )}
      </Box>

      {/* Search & Quick Filter Bar */}
      <Box sx={{ mb: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          size="small"
          placeholder={t('clients.search_placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            width: { xs: '100%', sm: 380 },
            bgcolor: '#FFFFFF',
            '& .MuiOutlinedInput-root': { borderRadius: 2.5 },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />
        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
          {t('clients.showing_count', { filtered: filteredClients.length, total: clients.length })}
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04)' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>{t('clients.th_name')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t('clients.th_pan')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t('clients.th_mobile')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t('clients.th_email')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">{t('clients.th_portfolio')}</TableCell>
                {(isRia || isAdmin) && (
                  <TableCell sx={{ fontWeight: 700 }} align="center">{t('clients.th_action')}</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={isRia || isAdmin ? 6 : 5} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isRia || isAdmin ? 6 : 5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    {searchQuery
                      ? t('clients.no_clients_found', { query: searchQuery })
                      : t('clients.no_clients_empty')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{client.name}</TableCell>
                    <TableCell sx={{ fontFamily: 'JetBrains Mono', fontWeight: 600 }}>
                      {client.pan}
                    </TableCell>
                    <TableCell>{client.mobile}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      ₹{formatNumber(client.portfolioValue || 0)}
                    </TableCell>
                    {(isRia || isAdmin) && (
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          component={RouterLink}
                          to={`/mandates/new?clientId=${client.id}`}
                          startIcon={<AssignmentOutlinedIcon sx={{ fontSize: 14 }} />}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 650,
                            borderRadius: 2,
                            fontSize: '0.75rem',
                            py: 0.4,
                            px: 1.2,
                            borderColor: '#CBD5E1',
                            color: '#1E293B',
                            '&:hover': { borderColor: '#0F172A', bgcolor: '#F8FAFC' },
                          }}
                        >
                          {t('clients.btn_draft_mandate')}
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add Client Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{t('clients.modal_title')}</DialogTitle>
        <Box component="form" onSubmit={handleCreateClient}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {modalError && <Alert severity="error">{modalError}</Alert>}

            <TextField
              label={t('clients.fld_name')}
              required
              fullWidth
              value={newClient.name}
              onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
              placeholder="e.g. Vikram Sharma"
            />

            <TextField
              label={t('clients.fld_pan')}
              required
              fullWidth
              value={newClient.pan}
              onChange={(e) => setNewClient({ ...newClient, pan: e.target.value.toUpperCase() })}
              placeholder="ABCDE1234F"
              helperText="10 characters (5 uppercase letters, 4 numbers, 1 letter)"
            />

            <TextField
              label={t('clients.fld_mobile')}
              required
              fullWidth
              value={newClient.mobile}
              onChange={(e) => setNewClient({ ...newClient, mobile: e.target.value })}
              placeholder="9820112345"
              helperText="10 digits. Client will receive trade authorization OTPs here."
            />

            <TextField
              label={t('clients.fld_email')}
              type="email"
              required
              fullWidth
              value={newClient.email}
              onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
              placeholder="client@familyoffice.in"
            />

            <TextField
              label={t('clients.fld_portfolio')}
              type="number"
              fullWidth
              value={newClient.portfolioValue}
              onChange={(e) => setNewClient({ ...newClient, portfolioValue: e.target.value })}
              placeholder="2500000"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenModal(false)}>{t('common.cancel')}</Button>
            <Button type="submit" variant="contained">
              {t('clients.btn_save_client')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
};
