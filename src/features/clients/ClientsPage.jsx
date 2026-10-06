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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const ClientsPage = () => {
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700}>
            Advisory Client Directory
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage client profiles, verified PAN records, and registered mobile numbers for OTP sign-offs
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<PersonAddAltOutlinedIcon />}
          onClick={() => setOpenModal(true)}
        >
          Add Advisory Client
        </Button>
      </Box>

      {queryError && <Alert severity="error" sx={{ mb: 3 }}>{queryError.message}</Alert>}

      <Card elevation={2} sx={{ borderRadius: 3, border: 1, borderColor: 'divider' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Client Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>PAN Number</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Registered Mobile</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email Address</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Portfolio Size (₹)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No client profiles added yet. Click "Add Advisory Client" to onboard your first client.
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{client.name}</TableCell>
                    <TableCell sx={{ fontFamily: 'JetBrains Mono', fontWeight: 600 }}>
                      {client.pan}
                    </TableCell>
                    <TableCell>{client.mobile}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      ₹{(client.portfolioValue || 0).toLocaleString('en-IN')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add Client Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Onboard Advisory Client</DialogTitle>
        <Box component="form" onSubmit={handleCreateClient}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {modalError && <Alert severity="error">{modalError}</Alert>}

            <TextField
              label="Client Full Name"
              required
              fullWidth
              value={newClient.name}
              onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
              placeholder="e.g. Vikram Sharma"
            />

            <TextField
              label="Permanent Account Number (PAN)"
              required
              fullWidth
              value={newClient.pan}
              onChange={(e) => setNewClient({ ...newClient, pan: e.target.value.toUpperCase() })}
              placeholder="ABCDE1234F"
              helperText="10 characters (5 uppercase letters, 4 numbers, 1 letter)"
            />

            <TextField
              label="Registered Mobile Number (for OTP)"
              required
              fullWidth
              value={newClient.mobile}
              onChange={(e) => setNewClient({ ...newClient, mobile: e.target.value })}
              placeholder="9820112345"
              helperText="10 digits. Client will receive trade authorization OTPs here."
            />

            <TextField
              label="Email Address"
              type="email"
              required
              fullWidth
              value={newClient.email}
              onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
              placeholder="client@familyoffice.in"
            />

            <TextField
              label="Approx. Advisory Portfolio Value (₹)"
              type="number"
              fullWidth
              value={newClient.portfolioValue}
              onChange={(e) => setNewClient({ ...newClient, portfolioValue: e.target.value })}
              placeholder="2500000"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save Client Profile
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
};
