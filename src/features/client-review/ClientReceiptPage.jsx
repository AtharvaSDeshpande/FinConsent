import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import CircularProgress from '@mui/material/CircularProgress';
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
        >
          Back to Proposal Overview
        </Button>
      </Box>

      <Card elevation={3} sx={{ borderRadius: 3, border: 1, borderColor: 'success.light', p: { xs: 3, md: 5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Logo size={36} />
          <Chip
            icon={<CheckCircleIcon />}
            label="SEBI Reg. 19 Statutory Certificate"
            color="success"
            sx={{ fontWeight: 700 }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ my: 3, textAlign: 'center' }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 56, mb: 1 }} />
          <Typography variant="h5" fontWeight={800} color="success.dark">
            Trade Mandate Authorized & Locked
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Electronic informed consent successfully committed to the immutable audit trail.
          </Typography>
        </Box>

        <Card elevation={0} sx={{ bgcolor: 'background.default', p: 3, borderRadius: 2, mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            STATUTORY EVIDENCE RECORD (SECTION 65B INDIAN EVIDENCE ACT)
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1.5 }}>
            <Typography variant="body2">
              Mandate Title: <strong>{mandate?.title}</strong>
            </Typography>
            <Typography variant="body2">
              Client: <strong>{client?.name}</strong> (PAN: <code>{client?.maskedPan}</code>)
            </Typography>
            <Typography variant="body2">
              Adviser: <strong>{ria?.firmName}</strong> (SEBI INA: <code>{ria?.sebiRegNumber}</code>)
            </Typography>
            <Typography variant="body2">
              Pre-computed Tax Acknowledged: <strong>₹{(mandate?.taxPayable || 0).toLocaleString('en-IN')}</strong>
            </Typography>
            <Typography variant="body2">
              Consent Mechanism: <strong>6-Digit Mobile OTP to verified mobile {client?.maskedMobile}</strong>
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', wordBreak: 'break-all', mt: 1 }}>
              SHA-256 Tamper-Evident Digest: <code>{mandate?.magicToken}</code>
            </Typography>
          </Box>
        </Card>

        <Alert severity="info" sx={{ mb: 3 }}>
          This record is preserved in append-only storage in AWS Mumbai (ap-south-1) for a statutory minimum of 5 years under Regulation 19 of the SEBI (Investment Advisers) Regulations, 2013.
        </Alert>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<PrintOutlinedIcon />}
            onClick={() => window.print()}
          >
            Print Compliance Certificate
          </Button>
        </Box>
      </Card>
    </Container>
  );
};
