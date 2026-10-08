import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { Logo } from '../../components/brand/Logo.jsx';
import { StatutoryBadge } from '../../components/brand/StatutoryBadge.jsx';
import { AdvanceTaxAlertBanner } from '../tax-engine/index.js';
import { OtpModal } from '../otp-consent/OtpModal.jsx';

export const ClientReviewPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  useEffect(() => {
    const fetchProposal = async () => {
      if (!token || token === 'undefined') {
        setError('Invalid or missing mandate token. Please request an active authorization link from your Registered Investment Adviser.');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/public/mandates/${token}`);
        const result = await res.json();

        if (res.status === 410 || result.expired || result.status === 'expired') {
          setIsExpired(true);
          setData(result.mandate);
          return;
        }

        if (!res.ok || !result.success) {
          throw new Error(result.error || 'Failed to load mandate proposal');
        }

        setData(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [token]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 2 }}>
        <CircularProgress color="primary" />
        <Typography variant="body2" color="text.secondary">
          Loading statutory trade proposal...
        </Typography>
      </Box>
    );
  }

  if (isExpired) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 }, textAlign: 'center' }}>
        <Card elevation={2} sx={{ p: { xs: 3, sm: 4.5 }, borderRadius: 4, border: 1, borderColor: 'error.light', bgcolor: '#FFFFFF' }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
            <AccessTimeOutlinedIcon sx={{ fontSize: 36, color: 'error.main' }} />
          </Box>
          <Typography variant="h5" fontWeight={800} color="#0F172A" gutterBottom>
            Proposal Authorization Window Expired
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6 }}>
            Under SEBI non-discretionary regulations, rebalancing proposals have a strict 48-hour cutoff window.
            This prevents executing trades at outdated market prices after market conditions have shifted.
          </Typography>

          <Alert severity="info" sx={{ my: 3, textAlign: 'left', borderRadius: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={750} gutterBottom>
              What should you do next?
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.5 }}>
              Your portfolio remains unchanged and protected. Please reach out to your SEBI Registered Investment Adviser to request an updated rebalancing proposal with current market valuations.
            </Typography>
          </Alert>

          <Button
            variant="contained"
            color="primary"
            startIcon={<EmailOutlinedIcon />}
            href={`mailto:${data?.ria?.complianceEmail || 'advisor@firm.in'}?subject=Request for Updated Trade Rebalance Mandate`}
            sx={{ fontWeight: 700, borderRadius: 2.5, px: 3, py: 1.2 }}
          >
            Contact Adviser for Fresh Proposal
          </Button>
        </Card>
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 4, sm: 8 }, textAlign: 'center' }}>
        <Card elevation={0} sx={{ p: { xs: 3.5, sm: 5 }, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: 'rgba(239, 68, 68, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
            }}
          >
            <ShieldOutlinedIcon sx={{ fontSize: 32, color: '#DC2626' }} />
          </Box>
          <Typography variant="h5" fontWeight={800} color="#0F172A" gutterBottom>
            Proposal Authorization Unavailable
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6 }}>
            {error || 'Unable to access trade proposal. The link may have been revoked by your investment adviser, expired, or already completed.'}
          </Typography>
          <Alert severity="info" sx={{ my: 3, textAlign: 'left', borderRadius: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={750} gutterBottom>
              Client Protection Notice
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.5 }}>
              Under SEBI Regulation 19, no trades may be executed on your account without prior explicit electronic authorization. Your current portfolio positions remain unchanged and secure.
            </Typography>
          </Alert>
          <Button
            variant="contained"
            component={RouterLink}
            to="/dashboard"
            sx={{ fontWeight: 700, borderRadius: 2.5, px: 3, py: 1.2, bgcolor: '#0F172A', '&:hover': { bgcolor: '#1E293B' } }}
          >
            Go to Investor Dashboard
          </Button>
        </Card>
      </Container>
    );
  }

  const { mandate, client, ria } = data;
  const isApproved = mandate.status === 'approved' || mandate.status === 'consented';
  const netCapitalGain = (Number(mandate.stcgAmount) || 0) + (Number(mandate.ltcgAmount) || 0);

  // Calculate cutoff window friendly time
  const cutoffTime = mandate.cutoffTimestamp ? new Date(mandate.cutoffTimestamp) : null;
  const now = new Date();
  const diffHours = cutoffTime ? Math.max(0, Math.round((cutoffTime - now) / (1000 * 60 * 60))) : null;

  return (
    <Container
      maxWidth="md"
      sx={{
        py: { xs: 2.5, md: 4 },
        px: { xs: 1.5, sm: 3 },
        width: '100%',
        maxWidth: { xs: '100%', sm: '640px', md: '880px' },
        boxSizing: 'border-box',
      }}
    >
      {/* 1. TRUST HEADER & ADVISER IDENTITY */}
      <Card
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          mb: 3,
          borderRadius: 3.5,
          bgcolor: '#FFFFFF',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Logo size={34} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StatutoryBadge status={mandate.status} />
            {cutoffTime && !isApproved && (
              <Chip
                icon={<AccessTimeOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                label={diffHours !== null ? `Review Window: ${diffHours}h left` : 'Window Active'}
                size="small"
                color={diffHours && diffHours < 12 ? 'warning' : 'default'}
                sx={{ fontWeight: 700, fontSize: '0.72rem' }}
              />
            )}
          </Box>
        </Box>

        <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="overline" color="primary" fontWeight={800} sx={{ letterSpacing: '0.08em' }}>
            STATUTORY TRADE REBALANCING PROPOSAL
          </Typography>
          <Typography variant="h5" component="h1" fontWeight={850} color="#0F172A" sx={{ mt: 0.5, lineHeight: 1.3 }}>
            {mandate.title}
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 3 }} sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed #E2E8F0' }}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                SEBI Registered Investment Adviser
              </Typography>
              <Typography variant="body2" fontWeight={750} color="#0F172A">
                {ria.firmName} <code style={{ fontSize: '0.8rem', background: '#F1F5F9', padding: '2px 6px', borderRadius: 4 }}>{ria.sebiRegNumber}</code>
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Prepared For Client
              </Typography>
              <Typography variant="body2" fontWeight={750} color="#0F172A">
                {client.name} <code style={{ fontSize: '0.8rem', background: '#F1F5F9', padding: '2px 6px', borderRadius: 4 }}>PAN: {client.maskedPan}</code>
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: 'rgba(2, 132, 199, 0.06)', display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShieldOutlinedIcon sx={{ fontSize: 18, color: '#0284C7' }} />
            <Typography variant="caption" color="#0369A1" fontWeight={650}>
              Non-Discretionary Investor Protection: Your adviser cannot execute these trades without your explicit OTP authorization.
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* 2. QUESTION 1: WHAT IS CHANGING? */}
      <Card elevation={0} sx={{ mb: 3, borderRadius: 3.5, border: '1px solid', borderColor: 'divider', bgcolor: '#FFFFFF' }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#4F46E5', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
              1
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#0F172A">
                What is changing?
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Target asset allocation comparison before and after rebalancing
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2.5}>
            {/* Current Allocation */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderRadius: 2.5, border: '1px solid', borderColor: '#E2E8F0', height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Current Portfolio Mix
                  </Typography>
                  <Chip label="Current" size="small" sx={{ fontSize: '0.68rem', height: 20 }} />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600} color="#334155">Equity Exposure</Typography>
                      <Typography variant="body2" fontWeight={750} color="#0F172A">{mandate.currentAllocation?.equity || 70}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={mandate.currentAllocation?.equity || 70} color="primary" sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600} color="#334155">Debt & Liquid</Typography>
                      <Typography variant="body2" fontWeight={750} color="#0F172A">{mandate.currentAllocation?.debt || 20}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={mandate.currentAllocation?.debt || 20} color="secondary" sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Proposed Target Allocation */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ p: 2.5, bgcolor: 'rgba(16, 185, 129, 0.05)', borderRadius: 2.5, border: '1.5px solid #10B981', height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="caption" fontWeight={800} color="#065F46" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Proposed Target Mix
                  </Typography>
                  <Chip label="Target" color="success" size="small" sx={{ fontSize: '0.68rem', height: 20, fontWeight: 700 }} />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600} color="#065F46">Equity Exposure</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" fontWeight={800} color="#065F46">{mandate.proposedAllocation?.equity || 60}%</Typography>
                        <Typography variant="caption" color="text.secondary">({(mandate.proposedAllocation?.equity || 60) - (mandate.currentAllocation?.equity || 70)}%)</Typography>
                      </Box>
                    </Box>
                    <LinearProgress variant="determinate" value={mandate.proposedAllocation?.equity || 60} color="success" sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600} color="#065F46">Debt & Liquid</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" fontWeight={800} color="#065F46">{mandate.proposedAllocation?.debt || 25}%</Typography>
                        <Typography variant="caption" color="success.main">(+{(mandate.proposedAllocation?.debt || 25) - (mandate.currentAllocation?.debt || 20)}%)</Typography>
                      </Box>
                    </Box>
                    <LinearProgress variant="determinate" value={mandate.proposedAllocation?.debt || 25} color="secondary" sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 3. QUESTION 2: WHY IS IT CHANGING? */}
      <Card elevation={0} sx={{ mb: 3, borderRadius: 3.5, border: '1px solid', borderColor: 'divider', bgcolor: '#FFFFFF' }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#4F46E5', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
              2
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#0F172A">
                Why is it changing?
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Professional rationale from your investment adviser
              </Typography>
            </Box>
          </Box>

          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <TrendingUpOutlinedIcon color="primary" sx={{ mt: 0.3 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={750} color="#0F172A" gutterBottom>
                  Adviser Investment Rationale & Rebalance Strategy
                </Typography>
                <Typography variant="body2" color="#475569" sx={{ lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                  {mandate.rationale || 'Due to recent market equity appreciation, your equity allocation drifted beyond your intended risk profile. Rebalancing strategically trims high-gain equity positions to lock in capital gains and reallocates capital into high-quality debt & liquid assets. This ensures your portfolio remains aligned with your long-term goals while safeguarding accumulated profits.'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </CardContent>
      </Card>

      {/* 4. QUESTION 3: ESTIMATED TAX IMPACT */}
      <Card elevation={0} sx={{ mb: 3, borderRadius: 3.5, border: '1px solid', borderColor: 'divider', bgcolor: '#FFFFFF' }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#4F46E5', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
              3
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#0F172A">
                Estimated tax impact
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pre-calculated capital gains tax and advance tax notice under latest budget rules
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                  Short-Term Capital Gains (STCG)
                </Typography>
                <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ my: 0.5 }}>
                  ₹{(Number(mandate.stcgAmount) || 0).toLocaleString('en-IN')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Taxed at 20% (Budget 2024)
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                  Long-Term Capital Gains (LTCG)
                </Typography>
                <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ my: 0.5 }}>
                  ₹{(Number(mandate.ltcgAmount) || 0).toLocaleString('en-IN')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Taxed at 12.5% above ₹1.25L exemption
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ p: 2, bgcolor: 'rgba(79, 70, 229, 0.06)', borderRadius: 2, border: '1.5px solid #6366F1' }}>
                <Typography variant="caption" color="primary.main" fontWeight={750} display="block">
                  Estimated Tax Payable
                </Typography>
                <Typography variant="h6" fontWeight={850} color="#4F46E5" sx={{ my: 0.5 }}>
                  ₹{(mandate.taxPayable || 0).toLocaleString('en-IN')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Pre-computed to prevent surprises
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Advance Tax Alert if applicable */}
          <AdvanceTaxAlertBanner
            installment={mandate.advanceTaxQuarter || 'Q4'}
            totalTax={mandate.taxPayable}
            netGain={netCapitalGain}
          />
        </CardContent>
      </Card>

      {/* 5. QUESTION 4: WHAT AM I APPROVING? */}
      <Card elevation={0} sx={{ mb: 3, borderRadius: 3.5, border: '1px solid', borderColor: 'divider', bgcolor: '#FFFFFF' }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#4F46E5', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
              4
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#0F172A">
                What am I approving?
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Explicit rebalancing checklist and securities list
              </Typography>
            </Box>
          </Box>

          {/* Plain Language Investor Rights Checklist */}
          <Box sx={{ p: 2, mb: 2.5, borderRadius: 2.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 1.2 }}>
            {[
              'I authorize my adviser to submit trade orders to rebalance my portfolio according to the proposed allocation above.',
              `I acknowledge the pre-computed capital gains tax obligation of ₹${(mandate.taxPayable || 0).toLocaleString('en-IN')}.`,
              'I understand this approval is valid only within the specified 48-hour cutoff window to prevent market slippage.',
            ].map((text, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <CheckCircleOutlineIcon color="primary" sx={{ fontSize: 18, mt: 0.2 }} />
                <Typography variant="body2" color="#334155" sx={{ lineHeight: 1.5 }}>
                  {text}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Rebalance Basket Table */}
          {mandate.sellBasket?.length > 0 && (
            <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Security to Reallocate</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Units</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }} align="right">Value (₹)</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Gain Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mandate.sellBasket.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ fontWeight: 650 }}>{item.securityName}</TableCell>
                      <TableCell>{item.units}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        ₹{item.saleValue?.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.gainType}
                          size="small"
                          color={item.gainType === 'STCG' ? 'warning' : 'primary'}
                          variant="outlined"
                          sx={{ fontWeight: 700, fontSize: '0.68rem', height: 20 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* 6. QUESTION 5: APPROVE & AUTHORIZE */}
      <Box sx={{ mt: 4, mb: 6, textAlign: 'center' }}>
        {isApproved ? (
          <Card elevation={2} sx={{ p: 4, bgcolor: 'rgba(16, 185, 129, 0.08)', borderColor: 'success.main', border: 1.5, borderRadius: 4 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 52, mb: 1 }} />
            <Typography variant="h5" fontWeight={850} color="success.dark">
              Mandate Authorized & Locked
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2.5, maxWidth: 480, mx: 'auto' }}>
              Your informed consent has been authenticated via Mobile OTP and registered under SEBI Regulation 19.
            </Typography>
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={() => navigate(`/m/${token}/receipt`)}
              sx={{ fontWeight: 750, px: 4, py: 1.3, borderRadius: 2.5 }}
            >
              View Official Compliance Receipt
            </Button>
          </Card>
        ) : (
          <Card elevation={2} sx={{ p: { xs: 3, sm: 4.5 }, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: '#FFFFFF' }}>
            <Typography variant="h5" fontWeight={850} color="#0F172A" gutterBottom>
              Grant Statutory Rebalancing Authorization
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 540, mx: 'auto', mb: 3, lineHeight: 1.6 }}>
              By authorizing, you grant non-discretionary consent to your SEBI Registered Investment Adviser to execute the specified rebalance orders.
              A one-time password (OTP) will be sent to your registered mobile number <strong>{client.maskedMobile}</strong>.
            </Typography>

            <Button
              variant="contained"
              size="large"
              startIcon={<LockOutlinedIcon />}
              endIcon={<ArrowForwardIcon />}
              onClick={() => setShowOtpModal(true)}
              sx={{
                px: { xs: 3, sm: 5 },
                py: 1.6,
                fontSize: { xs: '0.98rem', sm: '1.05rem' },
                fontWeight: 800,
                borderRadius: 3,
                bgcolor: '#0F172A',
                color: '#FFFFFF',
                '&:hover': { bgcolor: '#1E293B' },
                boxShadow: '0 8px 25px rgba(15, 23, 42, 0.25)',
              }}
            >
              Authorize with Mobile OTP
            </Button>

            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 2 }}>
              Statutory 6-digit OTP verification • Preserved in AWS Mumbai for 5 years under SEBI Regulation 19
            </Typography>
          </Card>
        )}
      </Box>

      {/* OTP Consent Modal */}
      <OtpModal
        open={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        token={token}
        mandate={mandate}
        maskedMobile={client.maskedMobile}
        onVerified={() => {
          setShowOtpModal(false);
          navigate(`/m/${token}/receipt`);
        }}
      />
    </Container>
  );
};

export default ClientReviewPage;
