import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Slider from '@mui/material/Slider';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { TaxBreakdownCard, AdvanceTaxAlertBanner, calculateIndianGainsTax } from '../tax-engine/index.js';

export const MandateNewPage = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientId, setClientId] = useState('');
  const [manualOverride, setManualOverride] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);

  const [title, setTitle] = useState('');
  const [stcgAmount, setStcgAmount] = useState(60000);
  const [ltcgAmount, setLtcgAmount] = useState(120000);
  const [cutoffHours, setCutoffHours] = useState(48);
  const [allocations, setAllocations] = useState({
    equity: 60,
    debt: 25,
    gold: 10,
    cash: 5,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [quotaModalOpen, setQuotaModalOpen] = useState(false);
  const [quotaPrompt, setQuotaPrompt] = useState(null);
  const navigate = useNavigate();

  // Pick a random client from the list
  const assignRandomClient = (clientList, excludeId = null) => {
    if (!clientList || clientList.length === 0) return;
    const candidates = clientList.length > 1 && excludeId
      ? clientList.filter((c) => c.id !== excludeId)
      : clientList;
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    setSelectedClient(picked);
    setClientId(picked.id);
    setTitle(`Q1 FY27 Strategic Trade Rebalance — ${picked.name}`);
  };

  useEffect(() => {
    const fetchClients = async () => {
      setLoadingClients(true);
      try {
        const token = localStorage.getItem('finconsent_token');
        const res = await fetch('/api/clients', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          setClients(data.data);
          // Automated Client Selection: Randomly assigned when drafting is in process
          assignRandomClient(data.data);
        }
      } catch (err) {
        console.error('[Clients Fetch Error]:', err);
      } finally {
        setLoadingClients(false);
      }
    };
    fetchClients();
  }, []);

  const handleRerollClient = () => {
    assignRandomClient(clients, clientId);
  };

  const handleManualClientChange = (id) => {
    setClientId(id);
    const found = clients.find((c) => c.id === id);
    if (found) {
      setSelectedClient(found);
      setTitle(`Q1 FY27 Strategic Trade Rebalance — ${found.name}`);
    }
  };

  const computed = calculateIndianGainsTax({ stcgAmount, ltcgAmount });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!clientId) {
      setError('An advisory client must be assigned to this mandate');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a descriptive proposal title');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('finconsent_token');
      const res = await fetch('/api/mandates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientId,
          title,
          currentAllocation: { equity: 75, debt: 15, gold: 5, cash: 5 },
          proposedAllocation: allocations,
          stcgAmount: Number(stcgAmount) || 0,
          ltcgAmount: Number(ltcgAmount) || 0,
          cutoffHours: Number(cutoffHours) || 48,
          sellBasket: [
            {
              securityName: 'Equities Profit Booking Basket',
              units: 500,
              saleValue: Number(stcgAmount) + Number(ltcgAmount),
              gainType: 'Mixed STCG/LTCG',
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.quotaExceeded) {
          setQuotaPrompt(data.upgradePrompt || {
            title: 'Free Tier Monthly Mandate Quota Exceeded',
            message: 'You have utilized all 3 trade mandates allowed in the Free Tier this calendar month.',
            whatsappUpgradeUrl: 'https://wa.me/919876543210?text=Hi%2C%20I%20want%20to%20upgrade%20to%20FinConsent%20Pro',
            billingUrl: '/billing',
          });
          setQuotaModalOpen(true);
          return;
        }
        throw new Error(data.error || 'Failed to create mandate');
      }

      navigate(`/mandates/${data.data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          component={RouterLink}
          to="/dashboard"
          startIcon={<ArrowBackOutlinedIcon />}
          size="small"
          sx={{ mb: 1, textTransform: 'none' }}
        >
          Back to Control Center
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography variant="h4" component="h1" fontWeight={800} letterSpacing="-0.02em">
            Draft Statutory Rebalance Mandate
          </Typography>
          <Chip
            icon={<AutoAwesomeIcon sx={{ fontSize: '14px !important' }} />}
            label="Automated Client Assignment Enabled"
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 700 }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          SEBI Regulation 19 compliant portfolio rebalancing with pre-computed capital gains tax & Advance Tax alerts
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Main Proposal Form */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card elevation={2} sx={{ borderRadius: 3, border: 1, borderColor: 'divider' }}>
              <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                {/* 1. Automated Client Selection Section */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="h6" fontWeight={700}>
                      1. Advisory Client Allocation
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ShuffleIcon />}
                        onClick={handleRerollClient}
                        disabled={loadingClients || clients.length <= 1}
                        sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
                      >
                        Auto-Assign Another Client
                      </Button>
                      <Button
                        size="small"
                        color="inherit"
                        startIcon={<EditOutlinedIcon />}
                        onClick={() => setManualOverride(!manualOverride)}
                        sx={{ textTransform: 'none', fontSize: '0.78rem' }}
                      >
                        {manualOverride ? 'Hide Manual Picker' : 'Manual Picker'}
                      </Button>
                    </Box>
                  </Box>

                  {/* Automated Assignment Display Card */}
                  {loadingClients ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                      <CircularProgress size={20} />
                      <Typography variant="body2" color="text.secondary">
                        Loading client database and auto-assigning advisory client...
                      </Typography>
                    </Box>
                  ) : selectedClient ? (
                    <Box
                      sx={{
                        p: 2.2,
                        bgcolor: 'rgba(99, 102, 241, 0.05)',
                        border: '1px solid rgba(99, 102, 241, 0.25)',
                        borderRadius: 2.5,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.2,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircleOutlineIcon color="primary" fontSize="small" />
                          <Typography variant="subtitle1" fontWeight={700}>
                            {selectedClient.name}
                          </Typography>
                          <Chip label="Auto-Assigned" size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                        </Box>
                        <Typography variant="caption" sx={{ fontFamily: 'JetBrains Mono', color: 'text.secondary' }}>
                          ID: {selectedClient.id}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', fontSize: '0.82rem' }}>
                        <Chip label={`PAN: ${selectedClient.pan}`} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                        <Chip label={`Mobile: ${selectedClient.mobile}`} size="small" variant="outlined" />
                        <Chip
                          label={`Portfolio: ₹${(selectedClient.portfolioValue || 7500000).toLocaleString('en-IN')}`}
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ fontWeight: 700 }}
                        />
                      </Box>
                    </Box>
                  ) : (
                    <Alert severity="warning">No clients found in the database. Please add an advisory client first.</Alert>
                  )}

                  {/* Manual Override Dropdown */}
                  {manualOverride && (
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        select
                        label="Select Client Manually"
                        fullWidth
                        size="small"
                        value={clientId}
                        onChange={(e) => handleManualClientChange(e.target.value)}
                      >
                        {clients.map((c) => (
                          <MenuItem key={c.id} value={c.id}>
                            {c.name} (PAN: {c.pan}) — ₹{(c.portfolioValue || 0).toLocaleString('en-IN')}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  )}
                </Box>

                <Divider sx={{ my: 2.5 }} />

                {/* 2. Mandate Proposal Parameters */}
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  2. Proposal Details & Market Window
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Mandate Proposal Title"
                    required
                    fullWidth
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Q1 FY27 Strategic Rebalance Proposal"
                    size="small"
                  />

                  <TextField
                    select
                    label="Market Cutoff Expiry Window"
                    fullWidth
                    size="small"
                    value={cutoffHours}
                    onChange={(e) => setCutoffHours(e.target.value)}
                    helperText="Mandate will automatically expire if client consent is not verified before cutoff"
                  >
                    <MenuItem value={4}>4 Hours (Intraday Market Execution Cutoff)</MenuItem>
                    <MenuItem value={24}>24 Hours (Next Trading Session 2:30 PM IST)</MenuItem>
                    <MenuItem value={48}>48 Hours (Standard Advisory Cycle Cutoff)</MenuItem>
                  </TextField>
                </Box>

                <Divider sx={{ my: 2.5 }} />

                {/* 3. Indian Capital Gains Estimation */}
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  3. Indian Capital Gains Estimation
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Short-Term Capital Gain (STCG ₹)"
                      type="number"
                      fullWidth
                      required
                      size="small"
                      value={stcgAmount}
                      onChange={(e) => setStcgAmount(e.target.value)}
                      helperText="Taxed at flat 20% under Section 111A"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Long-Term Capital Gain (LTCG ₹)"
                      type="number"
                      fullWidth
                      required
                      size="small"
                      value={ltcgAmount}
                      onChange={(e) => setLtcgAmount(e.target.value)}
                      helperText="Taxed at 12.5% beyond ₹1.25L exemption"
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2.5 }} />

                {/* 4. Target Asset Allocation Sliders */}
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  4. Target Asset Allocation (%)
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600}>
                        Equity Target
                      </Typography>
                      <Typography variant="body2" fontWeight={700} color="primary.main">
                        {allocations.equity}%
                      </Typography>
                    </Box>
                    <Slider
                      value={allocations.equity}
                      onChange={(e, val) => setAllocations({ ...allocations, equity: val })}
                      min={0}
                      max={100}
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600}>
                        Debt & Arbitrage Target
                      </Typography>
                      <Typography variant="body2" fontWeight={700} color="secondary.main">
                        {allocations.debt}%
                      </Typography>
                    </Box>
                    <Slider
                      value={allocations.debt}
                      onChange={(e, val) => setAllocations({ ...allocations, debt: val })}
                      min={0}
                      max={100}
                      color="secondary"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column: Real-Time Tax Calculator Preview */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TaxBreakdownCard
                stcgAmount={stcgAmount}
                ltcgAmount={ltcgAmount}
                customTitle="Live Pre-computed Tax Impact"
              />

              <AdvanceTaxAlertBanner
                installment={computed.nextInstallment}
                totalTax={computed.totalTax}
              />

              <Card elevation={2} sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Ready to Dispatch
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Saving will generate a 256-bit cryptographically signed magic link that your client can inspect and authorize on mobile with 6-digit OTP.
                </Typography>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={submitting || !clientId}
                  startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <SendOutlinedIcon />}
                  sx={{
                    py: 1.3,
                    fontWeight: 700,
                    borderRadius: 2.5,
                    background: 'linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)',
                  }}
                >
                  {submitting ? 'Creating Proposal...' : 'Create & Generate Magic Link'}
                </Button>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Free Tier Quota Exceeded Modal with WhatsApp Prompt */}
      <Dialog
        open={quotaModalOpen}
        onClose={() => setQuotaModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <WorkspacePremiumIcon color="warning" />
          {quotaPrompt?.title || 'Monthly Mandate Quota Exceeded'}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" paragraph>
            {quotaPrompt?.message ||
              'You have reached the monthly limit of 3 trade mandates on the Free Plan. Upgrade to Pro RIA to unlock unlimited statutory trade authorizations.'}
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Under SEBI regulations, client consent records must be maintained systematically. Pro RIA tier unlocks unlimited mandates, audit exports, and automated WhatsApp delivery.
          </Alert>
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" fontWeight={700}>
              FinConsent Pro Plan — ₹4,999 / year
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Unlimited monthly trade mandates & magic links<br />
              • WhatsApp Direct Dispatch integration<br />
              • SEBI Regulation 19 audit dossier PDF generation<br />
              • Custom RIA firm logo & advisory disclosures
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setQuotaModalOpen(false)} color="inherit">
            Dismiss
          </Button>
          <Button
            variant="outlined"
            color="success"
            startIcon={<WhatsAppIcon />}
            href={quotaPrompt?.whatsappUpgradeUrl || 'https://wa.me/919876543210'}
            target="_blank"
            rel="noopener noreferrer"
          >
            Upgrade via WhatsApp
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<WorkspacePremiumIcon />}
            component={RouterLink}
            to="/settings/billing"
          >
            Upgrade with Razorpay
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MandateNewPage;
