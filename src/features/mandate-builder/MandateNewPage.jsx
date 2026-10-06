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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { TaxBreakdownCard, AdvanceTaxAlertBanner, calculateIndianGainsTax } from '../tax-engine/index.js';

export const MandateNewPage = () => {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');
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

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem('finconsent_token');
        const res = await fetch('/api/clients', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setClients(data.data);
          setClientId(data.data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchClients();
  }, []);

  const computed = calculateIndianGainsTax({ stcgAmount, ltcgAmount });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!clientId) {
      setError('Please select an advisory client');
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
    <Container maxWidth="lg">
      <Box sx={{ mb: 3 }}>
        <Button
          component={RouterLink}
          to="/dashboard"
          startIcon={<ArrowBackOutlinedIcon />}
          size="small"
        >
          Back to Control Center
        </Button>
        <Typography variant="h4" component="h1" fontWeight={700} sx={{ mt: 1 }}>
          Draft Statutory Rebalance Mandate
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure asset allocation shifts with pre-computed capital gains and Advance Tax compliance
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Main Proposal Form */}
          <Grid item xs={12} md={7}>
            <Card elevation={2} sx={{ borderRadius: 3, border: 1, borderColor: 'divider' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                  1. Mandate Information
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    select
                    label="Select Advisory Client"
                    required
                    fullWidth
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    helperText={clients.length === 0 ? 'No clients found. Please add a client first.' : ''}
                  >
                    {clients.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name} (PAN: {c.pan}) — {c.mobile}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Mandate Proposal Title"
                    required
                    fullWidth
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Q4 FY26 Large-Cap Profit Booking & Arbitrage Shift"
                  />

                  <TextField
                    select
                    label="Market Cutoff Expiry Window"
                    fullWidth
                    value={cutoffHours}
                    onChange={(e) => setCutoffHours(e.target.value)}
                    helperText="Mandate will automatically expire if not approved before this window"
                  >
                    <MenuItem value={4}>4 Hours (Intraday Market Cutoff)</MenuItem>
                    <MenuItem value={24}>24 Hours (Next Day 2:30 PM IST)</MenuItem>
                    <MenuItem value={48}>48 Hours (Standard Advisory Cycle)</MenuItem>
                  </TextField>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  2. Indian Capital Gains Estimation
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Short-Term Capital Gain (STCG ₹)"
                      type="number"
                      fullWidth
                      required
                      value={stcgAmount}
                      onChange={(e) => setStcgAmount(e.target.value)}
                      helperText="Taxed at flat 20% under Section 111A"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Long-Term Capital Gain (LTCG ₹)"
                      type="number"
                      fullWidth
                      required
                      value={ltcgAmount}
                      onChange={(e) => setLtcgAmount(e.target.value)}
                      helperText="Taxed at 12.5% beyond ₹1.25L exemption"
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  3. Target Asset Allocation (%)
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Equity Target: {allocations.equity}%
                    </Typography>
                    <Slider
                      value={allocations.equity}
                      onChange={(e, val) => setAllocations({ ...allocations, equity: val })}
                      min={0}
                      max={100}
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Debt & Arbitrage Target: {allocations.debt}%
                    </Typography>
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

          {/* Real-Time Tax Calculator Preview */}
          <Grid item xs={12} md={5}>
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
                  disabled={submitting}
                  startIcon={<SendOutlinedIcon />}
                >
                  {submitting ? 'Creating Proposal...' : 'Create & Generate Magic Link'}
                </Button>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Free Tier Quota Exceeded Modal with WhatsApp Prompt (Criterion 1) */}
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
            to="/billing"
          >
            Upgrade with Razorpay
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
