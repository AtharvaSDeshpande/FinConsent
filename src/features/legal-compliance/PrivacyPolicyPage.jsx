import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import CloudQueueOutlinedIcon from '@mui/icons-material/CloudQueueOutlined';

export const PrivacyPolicyPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Card elevation={2} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, border: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <ShieldOutlinedIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1" fontWeight={800}>
            Privacy Policy
          </Typography>
        </Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Compliant with India's Digital Personal Data Protection (DPDP) Act, 2023
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, my: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={<CloudQueueOutlinedIcon />}
            label="Data Residency: AWS Mumbai (ap-south-1)"
            color="success"
            size="small"
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label="Zero Third-Party Advertising Pixels"
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              1. Data Fiduciary Identity & Scope
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              FinConsent operates as a Data Fiduciary under the Digital Personal Data Protection Act, 2023. We provide immutable record-keeping and consent workflow technology to SEBI-Registered Investment Advisers (RIAs).
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              2. Personal Data Collected & Processed
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              We collect and process only the minimal personal data required for statutory financial trade consent:
            </Typography>
            <ul>
              <li><Typography variant="body2" color="text.secondary">Adviser Information: Full name, official email, firm name, and SEBI Registration Number (INAXXXXXXXXXX).</Typography></li>
              <li><Typography variant="body2" color="text.secondary">Client Information: Full name, Permanent Account Number (PAN), mobile number for SMS OTP, and email address.</Typography></li>
              <li><Typography variant="body2" color="text.secondary">Electronic Telemetry: Client IP address, User-Agent browser string, and IST timestamps necessary for Section 65B IT Act admissibility.</Typography></li>
            </ul>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              3. Indian Data Residency & Storage Security
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              In strict adherence to Reserve Bank of India (RBI) and SEBI regulatory guidelines, all database records, cryptographic hashes, and audit dossiers are stored exclusively within Indian territorial borders on AWS Mumbai (Region: <code>ap-south-1</code>).
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              4. Statutory 5-Year Data Retention
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Under Regulation 19 of the SEBI (Investment Advisers) Regulations, 2013, records of client advice, trade rationale, and prior informed consent must be maintained for a statutory minimum of 5 years (1,825 days). In accordance with DPDP Act Section 8, audit records cannot be erased prior to the expiration of this statutory retention window.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              5. Zero Tracking & Cookie Policy
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              FinConsent uses strictly necessary, HTTP-only first-party session cookies. We do not embed Meta Pixels, Google Advertising tags, third-party analytics scripts, or behavioral tracking trackers.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              6. Grievance Redressal Officer
            </Typography>
            <Typography variant="body2" color="text.secondary">
              For privacy grievances or rights requests under the DPDP Act 2023, contact our designated Grievance Officer:
              <br />
              <strong>Grievance Officer, FinConsent Compliance Cell</strong>
              <br />
              Email: <code>grievance@finconsent.in</code> | Location: Mumbai, Maharashtra, India.
            </Typography>
          </Box>
        </Box>
      </Card>
    </Container>
  );
};
