import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Logo } from '../../components/brand/Logo.jsx';
import { StatutoryBadge } from '../../components/brand/StatutoryBadge.jsx';
import { TaxBreakdownCard, AdvanceTaxAlertBanner } from '../tax-engine/index.js';
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
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Card elevation={2} sx={{ p: 4, borderRadius: 3, border: 1, borderColor: 'error.light' }}>
          <ShieldOutlinedIcon sx={{ fontSize: 56, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Mandate Cutoff Window Expired
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            This proposal link has expired or has been revoked by your adviser to protect against execution slippage. Under SEBI non-discretionary regulations, expired mandates cannot be authorized.
          </Typography>
          <Alert severity="warning" sx={{ mt: 3, textAlign: 'left' }}>
            Please contact your SEBI Registered Investment Adviser to request an updated rebalancing mandate.
          </Alert>
        </Card>
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">{error || 'Unable to access trade proposal'}</Alert>
      </Container>
    );
  }

  const { mandate, client, ria } = data;
  const isApproved = mandate.status === 'approved' || mandate.status === 'consented';
  const netCapitalGain = (Number(mandate.stcgAmount) || 0) + (Number(mandate.ltcgAmount) || 0);

  return (
    <Container
      maxWidth="md"
      sx={{
        py: { xs: 2, md: 4 },
        px: { xs: 1.5, sm: 3 },
        width: '100%',
        maxWidth: { xs: '100%', sm: '600px', md: '900px' },
        boxSizing: 'border-box',
      }}
    >
      {/* Top Banner & RIA Header */}
      <Card elevation={1} sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 3, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Logo size={36} />
          <StatutoryBadge status={mandate.status} />
        </Box>

        <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h5" component="h1" fontWeight={700}>
            {mandate.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Adviser: <strong>{ria.firmName}</strong> (SEBI Reg: <code>{ria.sebiRegNumber}</code>)
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
            Prepared for: <strong>{client.name}</strong> (PAN: <code>{client.maskedPan}</code>)
          </Typography>
        </Box>
      </Card>

      {/* Advance Tax Section 234B/234C alert (triggers when net capital gain > ₹1,00,000) */}
      <AdvanceTaxAlertBanner
        installment={mandate.advanceTaxQuarter}
        totalTax={mandate.taxPayable}
        netGain={netCapitalGain}
      />

      {/* Asset Allocation Shift Comparison */}
      <Card elevation={2} sx={{ mb: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            Target Asset Allocation Shift
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  CURRENT ALLOCATION
                </Typography>
                <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">Equity</Typography>
                      <Typography variant="body2" fontWeight={600}>{mandate.currentAllocation?.equity || 70}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={mandate.currentAllocation?.equity || 70} color="primary" sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">Debt & Liquid</Typography>
                      <Typography variant="body2" fontWeight={600}>{mandate.currentAllocation?.debt || 20}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={mandate.currentAllocation?.debt || 20} color="secondary" sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ p: 2, bgcolor: 'rgba(5, 150, 105, 0.05)', border: 1, borderColor: 'success.light', borderRadius: 2 }}>
                <Typography variant="caption" fontWeight={700} color="success.dark">
                  PROPOSED ALLOCATION (TARGET)
                </Typography>
                <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">Equity</Typography>
                      <Typography variant="body2" fontWeight={600}>{mandate.proposedAllocation?.equity || 60}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={mandate.proposedAllocation?.equity || 60} color="success" sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">Debt & Liquid</Typography>
                      <Typography variant="body2" fontWeight={600}>{mandate.proposedAllocation?.debt || 25}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={mandate.proposedAllocation?.debt || 25} color="secondary" sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Rebalance Basket Table */}
      {mandate.sellBasket?.length > 0 && (
        <Card elevation={2} sx={{ mb: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Securities to Sell / Reallocate
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'background.default' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Security Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Units</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Value (₹)</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Gain Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mandate.sellBasket.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ fontWeight: 600 }}>{item.securityName}</TableCell>
                      <TableCell>{item.units}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        ₹{item.saleValue?.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.gainType}
                          size="small"
                          color={item.gainType === 'STCG' ? 'warning' : 'primary'}
                          variant="outlined"
                          sx={{ fontWeight: 700, fontSize: '0.68rem' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Capital Gains Tax Engine Card */}
      <TaxBreakdownCard
        stcgAmount={mandate.stcgAmount}
        ltcgAmount={mandate.ltcgAmount}
      />

      {/* Call to Action Bar */}
      <Box sx={{ mt: 4, mb: 6, textAlign: 'center' }}>
        {isApproved ? (
          <Card elevation={3} sx={{ p: 3, bgcolor: 'rgba(16, 185, 129, 0.08)', borderColor: 'success.main', border: 1, borderRadius: 3 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 44, mb: 1 }} />
            <Typography variant="h6" fontWeight={700} color="success.dark">
              Mandate Approved & Locked
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
              Statutory client consent has been verified via Mobile OTP.
            </Typography>
            <Button
              variant="outlined"
              color="success"
              onClick={() => navigate(`/m/${token}/receipt`)}
            >
              View Compliance Receipt & Audit Log
            </Button>
          </Card>
        ) : (
          <Card elevation={3} sx={{ p: 4, borderRadius: 3, border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Authorize Advisory Mandate
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 540, mx: 'auto', mb: 3 }}>
              By authorizing, you confirm informed consent under Regulation 19 of the SEBI (Investment Advisers) Regulations, 2013 and acknowledge the pre-computed tax obligations.
            </Typography>

            <Button
              variant="contained"
              size="large"
              color="primary"
              startIcon={<LockOutlinedIcon />}
              onClick={() => setShowOtpModal(true)}
              sx={{ px: 4, py: 1.5, fontSize: '1rem', fontWeight: 700 }}
            >
              Authorize Rebalance with Mobile OTP
            </Button>
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
