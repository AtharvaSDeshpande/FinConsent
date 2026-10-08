import React from 'react';
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
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { StatutoryBadge } from '../../components/brand/StatutoryBadge.jsx';

export const ClientDashboard = ({ user, mandates = [], loading = false, error = null }) => {
  const navigate = useNavigate();

  // Filter client's pending items vs completed archive
  const pendingMandates = mandates.filter((m) => m.status === 'sent' || m.status === 'viewed' || m.status === 'draft');
  const consentedMandates = mandates.filter((m) => m.status === 'consented' || m.status === 'approved');

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2.5, md: 4 } }}>
      {/* 1. Welcoming Investor Trust Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
          <Typography variant="h4" component="h1" fontWeight={800} letterSpacing="-0.025em" color="#0F172A">
            {`Welcome, ${user?.name || 'Valued Investor'}`}
          </Typography>
          <Chip
            icon={<ShieldOutlinedIcon sx={{ fontSize: '15px !important', color: '#047857' }} />}
            label="SEBI Reg. 19 Non-Discretionary Investor Account"
            sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              bgcolor: '#ECFDF5',
              color: '#047857',
              border: '1px solid #A7F3D0',
            }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720 }}>
          Here are your statutory portfolio rebalancing proposals and tax impact reviews prepared by your Registered Investment Adviser.
          No trade orders can be executed without your explicit review and mobile OTP authorization.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }}>{error}</Alert>}

      {/* 2. PRIORITY 1: ACTIONS REQUIRING ATTENTION */}
      <Box sx={{ mb: 4.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" fontWeight={800} color="#0F172A">
              Pending Rebalance Authorizations
            </Typography>
            <Chip
              label={pendingMandates.length}
              size="small"
              sx={{
                fontWeight: 800,
                height: 22,
                fontSize: '0.75rem',
                bgcolor: pendingMandates.length > 0 ? '#FEF3C7' : '#F1F5F9',
                color: pendingMandates.length > 0 ? '#B45309' : '#64748B',
                border: '1px solid',
                borderColor: pendingMandates.length > 0 ? '#FDE68A' : '#E2E8F0',
              }}
            />
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        ) : pendingMandates.length > 0 ? (
          <Grid container spacing={2.5}>
            {pendingMandates.map((m) => {
              const cutoffTime = m.cutoffTimestamp ? new Date(m.cutoffTimestamp) : null;
              const now = new Date();
              const diffHours = cutoffTime ? Math.max(0, Math.round((cutoffTime - now) / (1000 * 60 * 60))) : null;

              return (
                <Grid size={{ xs: 12 }} key={m.id}>
                  <Card
                    elevation={0}
                    sx={{
                      p: { xs: 2.5, sm: 3.5 },
                      borderRadius: 3.5,
                      border: '1.5px solid #CBD5E1',
                      bgcolor: '#FFFFFF',
                      boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#94A3B8',
                        boxShadow: '0 6px 24px rgba(15, 23, 42, 0.08)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                          <Typography variant="caption" sx={{ color: '#4F46E5', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            Action Required • Statutory Rebalance
                          </Typography>
                          {diffHours !== null && (
                            <Chip
                              icon={<AccessTimeOutlinedIcon sx={{ fontSize: '13px !important' }} />}
                              label={`${diffHours} hours remaining`}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                bgcolor: diffHours < 12 ? '#FEE2E2' : '#FEF3C7',
                                color: diffHours < 12 ? '#DC2626' : '#B45309',
                                border: '1px solid',
                                borderColor: diffHours < 12 ? '#FECACA' : '#FDE68A',
                              }}
                            />
                          )}
                        </Box>
                        <Typography variant="h5" fontWeight={850} color="#0F172A">
                          {m.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          Prepared by: <strong>{m.riaFirmName || 'Advisory Firm'}</strong> (SEBI INA: {m.riaSebiReg || 'INA000088921'})
                        </Typography>
                      </Box>

                      {/* Prominent Primary Review Action */}
                      <Button
                        variant="contained"
                        size="large"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => navigate(`/m/${m.magicToken}`)}
                        sx={{
                          fontWeight: 750,
                          borderRadius: 2.5,
                          px: 3.5,
                          py: 1.3,
                          bgcolor: '#0F172A',
                          color: '#FFFFFF',
                          '&:hover': { bgcolor: '#1E293B' },
                          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.2)',
                        }}
                      >
                        Review & Authorize
                      </Button>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={650}>
                          PROPOSED PORTFOLIO MIX
                        </Typography>
                        <Typography variant="body2" fontWeight={750} color="#0F172A" sx={{ mt: 0.3 }}>
                          Equity: {m.proposedAllocation?.equity || 60}% • Debt: {m.proposedAllocation?.debt || 25}% • Gold: {m.proposedAllocation?.gold || 10}%
                        </Typography>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={650}>
                          PRE-COMPUTED TAX OBLIGATION
                        </Typography>
                        <Typography variant="body2" fontWeight={800} color="#4F46E5" sx={{ mt: 0.3 }}>
                          ₹{(m.taxPayable || 0).toLocaleString('en-IN')} (FY 2026-27)
                        </Typography>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={650}>
                          STATUTORY SAFEGUARD
                        </Typography>
                        <Typography variant="body2" fontWeight={650} color="#059669" sx={{ mt: 0.3, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
                          Verified 6-Digit Mobile OTP Required
                        </Typography>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Card
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3.5,
              border: '1px solid #E2E8F0',
              bgcolor: '#F8FAFC',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                bgcolor: '#ECFDF5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 30 }} />
            </Box>
            <Typography variant="h6" fontWeight={800} color="#0F172A" gutterBottom>
              All Clear — No Portfolios Awaiting Authorization
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', lineHeight: 1.6 }}>
              Your holdings are currently in balance with your agreed investment advisory strategy.
              When your SEBI Registered Investment Adviser drafts a tactical rebalancing proposal, it will appear here for your review and consent.
            </Typography>
          </Card>
        )}
      </Box>

      {/* 3. PRIORITY 2: HISTORICAL AUTHORIZATIONS & STATUTORY RECEIPTS */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 2 }}>
          Authorized Mandate Archive & Certificates ({consentedMandates.length})
        </Typography>

        {consentedMandates.length === 0 ? (
          <Card elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No historical authorizations on record yet. Once you authorize a proposal with Mobile OTP, the official SEBI Regulation 19 certificate will be securely archived here.
            </Typography>
          </Card>
        ) : (
          <Card elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Proposal Title</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Investment Adviser</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Acknowledged Tax (₹)</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Consent Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }} align="center">Compliance Receipt</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {consentedMandates.map((m) => (
                    <TableRow key={m.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={750} color="#0F172A">
                          {m.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Authorized on {new Date(m.updatedAt || m.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={650}>
                          {m.riaFirmName || 'Adviser Firm'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
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
                          startIcon={<ReceiptLongOutlinedIcon sx={{ fontSize: 16 }} />}
                          onClick={() => navigate(`/m/${m.magicToken}/receipt`)}
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
                          View Certificate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}
      </Box>

      {/* 4. INVESTOR RIGHTS & ADVISOR INQUIRY CARDS */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#F8FAFC', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}>
              <VerifiedUserOutlinedIcon sx={{ color: '#0F172A', fontSize: 22 }} />
              <Typography variant="subtitle1" fontWeight={750} color="#0F172A">
                Your Statutory Protections under SEBI Regulations
              </Typography>
            </Box>
            <Stack spacing={1.2}>
              <Typography variant="caption" color="#334155" sx={{ display: 'block', lineHeight: 1.5 }}>
                • <strong>Prior Consent Mandatory:</strong> Under Regulation 19 of the SEBI (Investment Advisers) Regulations, 2013, an adviser cannot place trade orders without your prior informed electronic consent.
              </Typography>
              <Typography variant="caption" color="#334155" sx={{ display: 'block', lineHeight: 1.5 }}>
                • <strong>No Unplanned Tax Surprises:</strong> Capital gains taxes under Section 111A and Section 112A are computed prior to trade dispatch to give you complete visibility before approval.
              </Typography>
              <Typography variant="caption" color="#334155" sx={{ display: 'block', lineHeight: 1.5 }}>
                • <strong>Immutable Legal Proof:</strong> All OTP sign-offs are archived with SHA-256 tamper-evident integrity for a statutory retention window of 5 years.
              </Typography>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1 }}>
                <HelpOutlineOutlinedIcon sx={{ color: '#4F46E5', fontSize: 22 }} />
                <Typography variant="subtitle1" fontWeight={750} color="#0F172A">
                  Have a Question for Your Adviser?
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
                Need clarification regarding an asset reallocation thesis, tax implication, or financial objective? Submit an official advisory inquiry.
              </Typography>
            </Box>

            <Button
              variant="outlined"
              component={RouterLink}
              to="/requests"
              fullWidth
              sx={{
                fontWeight: 700,
                borderRadius: 2.5,
                py: 1.1,
                borderColor: '#CBD5E1',
                color: '#0F172A',
                '&:hover': { borderColor: '#0F172A', bgcolor: '#F8FAFC' },
              }}
            >
              Submit Inquiry to Adviser
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ClientDashboard;
