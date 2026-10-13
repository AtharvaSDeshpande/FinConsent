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
import { useI18n } from '../../i18n/I18nContext';

export const PrivacyPolicyPage = () => {
  const { t } = useI18n();

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Card elevation={2} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, border: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <ShieldOutlinedIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1" fontWeight={800}>
            {t('legal.privacy_title')}
          </Typography>
        </Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {t('legal.privacy_sub')}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, my: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={<ShieldOutlinedIcon />}
            label={t('legal.badge_dpdp')}
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
              1. Data Protection Scope & Role
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              FinConsent processes personal data in accordance with the Digital Personal Data Protection Act, 2023 (DPDP Act). For client mandates initiated by SEBI-Registered Investment Advisers (RIAs), the RIA entity acts as the primary Data Fiduciary, and FinConsent operates as the compliance technology processor ensuring end-to-end auditability and data protection.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              2. Personal Data Processed & Collected
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              We process minimal data necessary for regulatory advisory record-keeping and client verification:
            </Typography>
            <ul>
              <li><Typography variant="body2" color="text.secondary">Adviser Information: Full name, official email, firm name, and SEBI Registration Number (INAXXXXXXXXX).</Typography></li>
              <li><Typography variant="body2" color="text.secondary">Client Information: Full name, masked Permanent Account Number (PAN), mobile number, and registered email address for secure verification.</Typography></li>
              <li><Typography variant="body2" color="text.secondary">Electronic Verification Telemetry: Client IP address, User-Agent browser string, and Indian Standard Time (IST) timestamps to establish electronic record integrity under Section 63 of Bharatiya Sakshya Adhiniyam, 2023 (BSA) and Section 65B of the Indian Evidence Act.</Typography></li>
            </ul>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              3. Prototype Data Architecture & Hosting
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              The FinConsent evaluation prototype operates with local or cloud development databases. All demonstration records, cryptographic hashes, and prototype dossiers are processed within secure evaluation environments designed for compliance demonstration.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              4. Record Retention Principles
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Under Regulation 19 of the SEBI (Investment Advisers) Regulations, 2013, registered advisers are required to maintain records of client advice, rationale, and instructions. The FinConsent prototype demonstrates tamper-evident transition recording using SHA-256 event digests. These records are intended to assist recordkeeping and do not guarantee regulatory compliance or legal admissibility in court.
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
