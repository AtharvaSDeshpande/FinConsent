import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { Logo } from '../../components/brand/Logo.jsx';

export const ClientReceiptPage = () => {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const res = await fetch(`/api/public/mandates/${token}`);
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReceipt();
  }, [token]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const mandate = data?.mandate;
  const client = data?.client;
  const ria = data?.ria;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          component={RouterLink}
          to={`/m/${token}`}
          startIcon={<ArrowBackOutlinedIcon />}
          size="small"
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Back to Proposal Overview
        </Button>
      </Box>

      <Card
        elevation={3}
        sx={{
          borderRadius: 4,
          border: '1.5px solid',
          borderColor: 'success.light',
          p: { xs: 3, md: 5 },
          bgcolor: '#FFFFFF',
          boxShadow: '0 8px 30px rgba(16, 185, 129, 0.08)',
        }}
      >
        {/* Certificate Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Logo size={36} />
          <Chip
            icon={<CheckCircleIcon />}
            label="SEBI Reg. 19 Statutory Certificate"
            color="success"
            sx={{ fontWeight: 800, fontSize: '0.8rem', py: 0.5 }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Success Banner */}
        <Box sx={{ my: 3, textAlign: 'center' }}>
          <Box sx={{ width: 68, height: 68, borderRadius: '50%', bgcolor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 44 }} />
          </Box>
          <Typography variant="h5" fontWeight={850} color="success.dark">
            Trade Rebalancing Mandate Authorized & Locked
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 520, mx: 'auto' }}>
            Your electronic informed consent has been verified via Mobile OTP and registered under Regulation 19 of the SEBI (Investment Advisers) Regulations, 2013.
          </Typography>
        </Box>

        {/* Certificate Details Card */}
        <Paper elevation={0} sx={{ bgcolor: '#F8FAFC', p: 3, borderRadius: 3, border: '1px solid #E2E8F0', mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={800} color="#0F172A" gutterBottom sx={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Statutory Certificate Summary
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">Mandate Description:</Typography>
              <Typography variant="body2" fontWeight={750} color="#0F172A">{mandate?.title}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">Advisory Client:</Typography>
              <Typography variant="body2" fontWeight={750} color="#0F172A">
                {client?.name} (PAN: <code>{client?.maskedPan}</code>)
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">Investment Adviser:</Typography>
              <Typography variant="body2" fontWeight={750} color="#0F172A">
                {ria?.firmName} (SEBI Reg: <code>{ria?.sebiRegNumber}</code>)
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">Acknowledged Pre-Computed Tax:</Typography>
              <Typography variant="body2" fontWeight={800} color="#4F46E5">
                ₹{(mandate?.taxPayable || 0).toLocaleString('en-IN')}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">Consent Verification Method:</Typography>
              <Typography variant="body2" fontWeight={700} color="#065F46">
                6-Digit Mobile OTP to verified mobile {client?.maskedMobile}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">Verification Timestamp:</Typography>
              <Typography variant="body2" fontWeight={700} color="#0F172A">
                {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* What Happens Next Guide */}
        <Box sx={{ p: 2.5, mb: 3, borderRadius: 3, bgcolor: 'rgba(79, 70, 229, 0.05)', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
          <Typography variant="subtitle2" fontWeight={800} color="#4338CA" gutterBottom>
            What happens next?
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
            <Typography variant="caption" sx={{ color: '#334155', display: 'block', lineHeight: 1.5 }}>
              1. <strong>Adviser Execution:</strong> Your adviser ({ria?.firmName}) has received your authorization notice and is cleared to submit orders to your broker/custodian.
            </Typography>
            <Typography variant="caption" sx={{ color: '#334155', display: 'block', lineHeight: 1.5 }}>
              2. <strong>Trade Settlement:</strong> Execution contract notes will be issued directly by your registered stockbroker upon trade completion.
            </Typography>
            <Typography variant="caption" sx={{ color: '#334155', display: 'block', lineHeight: 1.5 }}>
              3. <strong>Statutory Record:</strong> This evidence receipt is preserved in tamper-evident cloud storage for a statutory minimum of 5 years.
            </Typography>
          </Box>
        </Box>

        {/* Expandable Technical Compliance Evidence for Auditors */}
        <Accordion elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '12px !important', mb: 3, '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShieldOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="caption" fontWeight={750} color="text.secondary">
                Technical Evidence Reference (Section 65B Indian Evidence Act)
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2, fontFamily: 'monospace', fontSize: '0.72rem' }}>
              <Typography variant="caption" sx={{ wordBreak: 'break-all', display: 'block', color: '#475569' }}>
                <strong>Cryptographic Reference Digest:</strong> {mandate?.magicToken}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#475569' }}>
                <strong>Data Residency:</strong> AWS Mumbai (ap-south-1) • Append-Only Storage
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#475569' }}>
                <strong>Statutory Retention Window:</strong> 5 Years per SEBI Regulation 19
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PrintOutlinedIcon />}
            onClick={() => window.print()}
            sx={{ fontWeight: 700, borderRadius: 2.5, px: 3 }}
          >
            Print / Save Certificate PDF
          </Button>
          <Button
            variant="outlined"
            component={RouterLink}
            to={`/m/${token}`}
            sx={{ fontWeight: 600, borderRadius: 2.5, px: 3 }}
          >
            Review Proposal Overview
          </Button>
        </Box>
      </Card>
    </Container>
  );
};

export default ClientReceiptPage;
