import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import SendIcon from '@mui/icons-material/Send';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../security/AuthContext.jsx';

const REQUEST_CATEGORIES = [
  'Portfolio Rebalance Advisory',
  'Statutory Compliance Review',
  'Tax Loss Harvesting Proposal',
  'Asset Allocation Drift Adjustment',
  'HNW Customized Advisory Mandate',
  'SEBI Audit Documentation Sign-Off',
];

const PRIORITY_COLORS = {
  standard: 'default',
  high: 'warning',
  urgent: 'error',
};

const STATUS_COLORS = {
  pending: 'warning',
  in_review: 'info',
  approved: 'success',
  completed: 'primary',
  rejected: 'error',
};

export const RequestComposerPage = () => {
  const { user, role, isComplianceOfficer, isClient, isRia, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Filter tab state
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseNotes, setResponseNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: isClient ? 'Portfolio Rebalance Advisory' : 'Portfolio Rebalance Advisory',
    clientId: '',
    priority: 'standard',
    description: '',
    proposedEquityRatio: 60,
    proposedDebtRatio: 25,
    proposedGoldRatio: 10,
    proposedCashRatio: 5,
  });

  // Fetch clients for dropdown & automated assignment
  const { data: clientsData = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const token = localStorage.getItem('finconsent_token');
      const res = await fetch('/api/clients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      return json.success ? json.data : [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const clients = clientsData;

  // Automated client assignment for RIA / Admin
  const handleAutoAssignClient = () => {
    if (clients.length === 0) return;
    const picked = clients[Math.floor(Math.random() * clients.length)];
    setFormData((prev) => ({
      ...prev,
      clientId: picked.id,
      title: prev.title || `Q1 FY27 Rebalance Proposal — ${picked.name}`,
    }));
  };

  useEffect(() => {
    if (clients.length > 0 && !formData.clientId && (isRia || isAdmin)) {
      handleAutoAssignClient();
    }
  }, [clients]);

  // Fetch requests using TanStack Query
  const {
    data: requests = [],
    isLoading: loadingRequests,
    error: requestsError,
  } = useQuery({
    queryKey: ['requests', statusFilter],
    queryFn: async () => {
      const token = localStorage.getItem('finconsent_token');
      const url = statusFilter === 'all' ? '/api/requests' : `/api/requests?status=${statusFilter}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch requests');
      }
      return json.data;
    },
    staleTime: 1000 * 30,
  });

  // TanStack Mutation with Optimistic UI Update
  const composeMutation = useMutation({
    mutationFn: async (newRequestPayload) => {
      const token = localStorage.getItem('finconsent_token');
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newRequestPayload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to submit request');
      }
      return json.data;
    },
    onMutate: async (newRequestPayload) => {
      await queryClient.cancelQueries({ queryKey: ['requests'] });
      const previousRequests = queryClient.getQueryData(['requests', statusFilter]) || [];
      const matchedClient = clients.find((c) => c.id === newRequestPayload.clientId);

      const optimisticRequest = {
        id: `temp-${Date.now()}`,
        ...newRequestPayload,
        clientName: matchedClient?.name || (isClient ? user?.name : 'General Advisory Client'),
        userName: user?.name || 'Authorized User',
        userRole: user?.role || 'ria',
        status: 'pending',
        createdAt: new Date().toISOString(),
        isOptimistic: true,
      };

      queryClient.setQueryData(['requests', statusFilter], [optimisticRequest, ...previousRequests]);
      return { previousRequests };
    },
    onError: (err, newRequest, context) => {
      if (context?.previousRequests) {
        queryClient.setQueryData(['requests', statusFilter], context.previousRequests);
      }
      setFormError(err.message || 'Failed to create request');
    },
    onSuccess: () => {
      setFormSuccess('Request successfully created and logged to audit trail.');
      setFormData({
        title: '',
        category: 'Portfolio Rebalance Advisory',
        clientId: '',
        priority: 'standard',
        description: '',
        proposedEquityRatio: 60,
        proposedDebtRatio: 25,
        proposedGoldRatio: 10,
        proposedCashRatio: 5,
      });
      setTimeout(() => setFormSuccess(''), 4000);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });

  // Mutation to update request status (Approve / Review / Resolve)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, responseNotes }) => {
      const token = localStorage.getItem('finconsent_token');
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, responseNotes }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update request');
      }
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      setSelectedRequest(null);
      setResponseNotes('');
    },
  });

  const totalAllocation =
    Number(formData.proposedEquityRatio) +
    Number(formData.proposedDebtRatio) +
    Number(formData.proposedGoldRatio) +
    Number(formData.proposedCashRatio);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.title.trim() || !formData.description.trim()) {
      setFormError('Please enter a request title and descriptive explanation.');
      return;
    }
    if (!isClient && totalAllocation !== 100) {
      setFormError(`Proposed asset allocation must equal 100% (Current: ${totalAllocation}%).`);
      return;
    }
    composeMutation.mutate(formData);
  };

  const assignedClientObj = clients.find((c) => c.id === formData.clientId);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Page Header */}
      <Box sx={{ mb: 3.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h4" component="h1" fontWeight={800} letterSpacing="-0.02em">
              {isComplianceOfficer
                ? 'Statutory Scrutiny & Requests Queue'
                : isClient
                ? 'My Advisory Inquiries & Proposals'
                : 'Advisory & Compliance Request Hub'}
            </Typography>
            <Chip
              label={`ROLE: ${role?.toUpperCase() || 'GUEST'}`}
              color={role === 'admin' ? 'secondary' : role === 'compliance_officer' ? 'info' : role === 'client' ? 'success' : 'primary'}
              size="small"
              sx={{ fontWeight: 800 }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {isComplianceOfficer
              ? 'Review advisory rationale, verify Regulation 19 asset allocation tolerances, and submit statutory sign-offs'
              : isClient
              ? 'View rebalancing proposals from your investment adviser or submit statutory advisory questions'
              : 'Compose and dispatch trade rebalancing requests, regulatory queries, and asset allocation adjustments'}
          </Typography>
        </Box>
      </Box>

      {/* Main Grid: Form / Scrutiny Panel (Left) & Requests Ledger (Right) */}
      <Grid container spacing={3}>
        {/* LEFT PANEL: Role-tailored action card */}
        <Grid size={{ xs: 12, lg: 5 }}>
          {isComplianceOfficer ? (
            // Compliance Officer Scrutiny Mode Card
            <Card elevation={2} sx={{ borderRadius: 3, border: 1, borderColor: 'info.light', position: 'sticky', top: 88 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <FactCheckOutlinedIcon color="info" />
                  <Typography variant="h6" fontWeight={700}>
                    Compliance Officer Scrutiny Panel
                  </Typography>
                </Box>
                <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
                  Select any pending request from the ledger on the right to examine trade justification, verify asset drift tolerances under Regulation 19, and submit statutory sign-off notes.
                </Alert>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, border: 1, borderColor: 'divider' }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" display="block">
                    AUDIT CHECKS IN SCOPE:
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                    • Fiduciary suitability analysis (Section 15)<br />
                    • Non-discretionary prior client consent mandate (Reg 19)<br />
                    • SHA-256 cryptographic audit chaining integrity<br />
                    • Advance Tax Section 234B/234C compliance alert
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : (
            // Request Composer Form for RIA, Admin, or Client
            <Card sx={{ borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04)', position: 'sticky', top: 88 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TuneIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>
                      {isClient ? 'Submit Advisory Inquiry' : 'Compose Advisory Request'}
                    </Typography>
                  </Box>
                  {!isClient && clients.length > 0 && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ShuffleIcon />}
                      onClick={handleAutoAssignClient}
                      sx={{ textTransform: 'none', borderRadius: 2, fontSize: '0.75rem' }}
                    >
                      Auto-Assign Client
                    </Button>
                  )}
                </Box>

                {formSuccess && <Alert severity="success" sx={{ mb: 2 }}>{formSuccess}</Alert>}
                {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Request Title / Objective"
                    required
                    fullWidth
                    size="small"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={isClient ? 'e.g. Query regarding Q1 Tax Harvesting Strategy' : 'e.g. Q1 FY27 Aggressive Equity Rebalance Authorization'}
                  />

                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        select
                        label="Category"
                        fullWidth
                        size="small"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        {REQUEST_CATEGORIES.map((cat) => (
                          <MenuItem key={cat} value={cat}>
                            {cat}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        select
                        label="Priority"
                        fullWidth
                        size="small"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      >
                        <MenuItem value="standard">Standard Priority</MenuItem>
                        <MenuItem value="high">High Priority</MenuItem>
                        <MenuItem value="urgent">Urgent / Immediate</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>

                  {!isClient && (
                    <>
                      {/* Client Assignment with automated feedback */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <TextField
                          select
                          label="Target Advisory Client"
                          fullWidth
                          size="small"
                          value={formData.clientId}
                          onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                        >
                          <MenuItem value="">-- General Multi-Client Advisory --</MenuItem>
                          {clients.map((c) => (
                            <MenuItem key={c.id} value={c.id}>
                              {c.name} (PAN: {c.pan}) — ₹{(c.portfolioValue || 0).toLocaleString('en-IN')}
                            </MenuItem>
                          ))}
                        </TextField>

                        {assignedClientObj && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, px: 1, py: 0.5, bgcolor: 'background.default', borderRadius: 1.5 }}>
                            <CheckCircleOutlineIcon color="primary" sx={{ fontSize: 16 }} />
                            <Typography variant="caption" color="text.secondary">
                              Assigned to <strong>{assignedClientObj.name}</strong> (PAN: {assignedClientObj.pan})
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Proposed Asset Allocation Breakdown (Only for Advisers) */}
                      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, border: 1, borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="caption" fontWeight={700} color="text.secondary">
                            PROPOSED ASSET ALLOCATION TARGETS
                          </Typography>
                          <Chip
                            label={`Sum: ${totalAllocation}%`}
                            color={totalAllocation === 100 ? 'success' : 'error'}
                            size="small"
                            sx={{ fontWeight: 700, height: 20, fontSize: '0.72rem' }}
                          />
                        </Box>

                        <Grid container spacing={1}>
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="caption" color="text.secondary">Equity %</Typography>
                            <TextField
                              type="number"
                              size="small"
                              fullWidth
                              value={formData.proposedEquityRatio}
                              onChange={(e) => setFormData({ ...formData, proposedEquityRatio: Number(e.target.value) })}
                            />
                          </Grid>
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="caption" color="text.secondary">Debt %</Typography>
                            <TextField
                              type="number"
                              size="small"
                              fullWidth
                              value={formData.proposedDebtRatio}
                              onChange={(e) => setFormData({ ...formData, proposedDebtRatio: Number(e.target.value) })}
                            />
                          </Grid>
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="caption" color="text.secondary">Gold %</Typography>
                            <TextField
                              type="number"
                              size="small"
                              fullWidth
                              value={formData.proposedGoldRatio}
                              onChange={(e) => setFormData({ ...formData, proposedGoldRatio: Number(e.target.value) })}
                            />
                          </Grid>
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="caption" color="text.secondary">Cash %</Typography>
                            <TextField
                              type="number"
                              size="small"
                              fullWidth
                              value={formData.proposedCashRatio}
                              onChange={(e) => setFormData({ ...formData, proposedCashRatio: Number(e.target.value) })}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    </>
                  )}

                  <TextField
                    label={isClient ? 'Query / Explanation' : 'Advisory Rationale / Description'}
                    required
                    fullWidth
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={isClient ? 'State your question or clarification regarding your portfolio...' : 'Provide statutory justification, rebalance thesis, or client mandate requirements...'}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={composeMutation.isPending ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                    disabled={composeMutation.isPending}
                    size="large"
                    sx={{
                      mt: 1,
                      py: 1.4,
                      fontWeight: 700,
                      borderRadius: 2.5,
                      bgcolor: '#0F172A',
                      color: '#FFFFFF',
                      '&:hover': { bgcolor: '#1E293B' },
                      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
                    }}
                  >
                    {composeMutation.isPending ? 'Submitting...' : isClient ? 'Submit Inquiry' : 'Submit Advisory Request'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* RIGHT PANEL: LIVE REQUESTS LEDGER */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04)' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h6" fontWeight={700}>
                Live Requests Ledger ({requests.length})
              </Typography>
              <Tabs
                value={statusFilter}
                onChange={(e, val) => setStatusFilter(val)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0.5, textTransform: 'capitalize' } }}
              >
                <Tab label="All" value="all" />
                <Tab label="Pending" value="pending" />
                <Tab label="In Review" value="in_review" />
                <Tab label="Approved" value="approved" />
                <Tab label="Completed" value="completed" />
              </Tabs>
            </Box>

            {requestsError && (
              <Alert severity="error" sx={{ m: 2 }}>
                {requestsError.message}
              </Alert>
            )}

            <TableContainer sx={{ maxHeight: 650 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Request & Submitter</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Category & Allocation</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingRequests ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={32} />
                      </TableCell>
                    </TableRow>
                  ) : requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                        No requests found in this ledger view.
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((req) => (
                      <TableRow
                        key={req.id}
                        hover
                        sx={{
                          opacity: req.isOptimistic ? 0.6 : 1,
                          bgcolor: req.isOptimistic ? 'action.hover' : 'inherit',
                        }}
                      >
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={700}>
                            {req.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            By {req.userName} ({req.userRole?.toUpperCase()}) • {new Date(req.createdAt).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                            Client: {req.clientName || 'General'}
                          </Typography>
                          {req.isOptimistic && (
                            <Chip label="Optimistic Syncing..." size="small" color="info" sx={{ ml: 1, height: 18, fontSize: '0.65rem' }} />
                          )}
                        </TableCell>

                        <TableCell>
                          <Chip label={req.category} size="small" variant="outlined" sx={{ mb: 0.5, fontSize: '0.72rem' }} />
                          <Typography variant="caption" display="block" color="text.secondary" sx={{ fontFamily: 'JetBrains Mono' }}>
                            Eq: {req.proposedEquityRatio}% | Dt: {req.proposedDebtRatio}% | Au: {req.proposedGoldRatio}% | Cash: {req.proposedCashRatio}%
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={req.priority?.toUpperCase()}
                            size="small"
                            color={PRIORITY_COLORS[req.priority] || 'default'}
                            sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                          />
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={req.status?.replace('_', ' ').toUpperCase()}
                            size="small"
                            color={STATUS_COLORS[req.status] || 'default'}
                            variant="filled"
                            sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                          />
                        </TableCell>

                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setSelectedRequest(req)}
                            sx={{ borderRadius: 2, textTransform: 'none' }}
                          >
                            {isComplianceOfficer ? 'Scrutinize' : 'Details'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>

      {/* DETAIL & AUDIT ACTION MODAL */}
      {selectedRequest && (
        <Dialog open={Boolean(selectedRequest)} onClose={() => setSelectedRequest(null)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>
            Request Details: {selectedRequest.title}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={`Status: ${selectedRequest.status?.toUpperCase()}`} color={STATUS_COLORS[selectedRequest.status] || 'default'} />
              <Chip label={`Priority: ${selectedRequest.priority?.toUpperCase()}`} color={PRIORITY_COLORS[selectedRequest.priority] || 'default'} />
              <Chip label={`Category: ${selectedRequest.category}`} variant="outlined" />
              <Chip label={`Role: ${selectedRequest.userRole?.toUpperCase()}`} variant="outlined" />
            </Box>

            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" display="block">
                DESCRIPTION & STATUTORY RATIONALE:
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>
                {selectedRequest.description}
              </Typography>
            </Box>

            {selectedRequest.responseNotes && (
              <Box sx={{ p: 2, bgcolor: 'rgba(56, 189, 248, 0.08)', borderRadius: 2, border: 1, borderColor: 'info.light' }}>
                <Typography variant="caption" fontWeight={700} color="info.dark" display="block">
                  COMPLIANCE / RIA RESPONSE NOTES:
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {selectedRequest.responseNotes}
                </Typography>
              </Box>
            )}

            {/* Compliance / Admin Actions */}
            {(isComplianceOfficer || isAdmin || isRia) && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Update Request Status & Statutory Notes
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  label="Add Note / Review Comments"
                  value={responseNotes}
                  onChange={(e) => setResponseNotes(e.target.value)}
                  placeholder="Enter SEBI audit note, approval remarks, or guidance..."
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={<AssignmentTurnedInIcon />}
                    onClick={() =>
                      updateStatusMutation.mutate({
                        id: selectedRequest.id,
                        status: 'approved',
                        responseNotes,
                      })
                    }
                  >
                    Mark Approved
                  </Button>
                  <Button
                    variant="contained"
                    color="info"
                    size="small"
                    onClick={() =>
                      updateStatusMutation.mutate({
                        id: selectedRequest.id,
                        status: 'in_review',
                        responseNotes,
                      })
                    }
                  >
                    Set In Review
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() =>
                      updateStatusMutation.mutate({
                        id: selectedRequest.id,
                        status: 'completed',
                        responseNotes,
                      })
                    }
                  >
                    Mark Completed
                  </Button>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setSelectedRequest(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default RequestComposerPage;
