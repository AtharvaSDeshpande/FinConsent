import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Logo } from '../../components/brand/Logo.jsx';

export const ComplianceDossierModal = ({ open, onClose, mandate, client, ria, auditLogs = [] }) => {
  if (!mandate) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={700}>
          SEBI Regulation 19 Compliance Dossier
        </Typography>
        <Chip
          icon={<CheckCircleIcon />}
          label="Certified Electronic Dossier"
          color="success"
          size="small"
        />
      </DialogTitle>

      <DialogContent dividers sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Logo size={36} />
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="subtitle2" fontWeight={700}>
              {ria?.firmName || 'Advisory Firm'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              SEBI INA: <strong>{ria?.sebiRegNumber}</strong>
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Compliance Email: {ria?.complianceEmail}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" fontWeight={700} gutterBottom>
          {mandate.title}
        </Typography>

        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, my: 2 }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            CLIENT MANDATE IDENTIFICATION
          </Typography>
          <Typography variant="body2">
            Client Name: <strong>{client?.name}</strong> | PAN: <strong>{client?.pan}</strong> | Mobile: <strong>{client?.mobile}</strong>
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Mandate Status: <strong>{mandate.status?.toUpperCase()}</strong> | Authorization Cutoff: <strong>{new Date(mandate.cutoffTimestamp).toLocaleString('en-IN')}</strong>
          </Typography>
        </Box>

        <Box sx={{ p: 2, border: 1, borderColor: 'warning.light', bgcolor: 'rgba(217, 119, 6, 0.05)', borderRadius: 2, my: 2 }}>
          <Typography variant="caption" fontWeight={700} color="warning.dark" sx={{ display: 'block', mb: 1 }}>
            CAPITAL GAINS & TAX OBLIGATION DISCLOSURE
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body2">Equity STCG: <strong>₹{(mandate.stcgAmount || 0).toLocaleString('en-IN')}</strong> (Tax: ₹{(mandate.stcgTax || 0).toLocaleString('en-IN')})</Typography>
            <Typography variant="body2">Equity LTCG: <strong>₹{(mandate.ltcgAmount || 0).toLocaleString('en-IN')}</strong> (Tax: ₹{(mandate.ltcgTax || 0).toLocaleString('en-IN')})</Typography>
            <Typography variant="body2">Total Tax Payable: <strong>₹{(mandate.taxPayable || 0).toLocaleString('en-IN')}</strong></Typography>
          </Box>
        </Box>

        <Box sx={{ my: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            IMMUTABLE AUDIT CHRONOLOGY
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {auditLogs.map((log, i) => (
              <Box key={i} sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {log.eventType} — IP {log.ipAddress}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'JetBrains Mono', wordBreak: 'break-all' }}>
                    Digest: {log.payloadHash?.slice(0, 32)}...
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ fontFamily: 'JetBrains Mono' }}>
                  {new Date(log.timestamp).toLocaleString('en-IN')}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          * Certificate Generated under Section 65B of the Indian Evidence Act, 1872. Preserved for statutory 5-year retention under Regulation 19 of the SEBI (Investment Advisers) Regulations, 2013.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          startIcon={<PrintOutlinedIcon />}
          onClick={() => window.print()}
        >
          Print Dossier (PDF)
        </Button>
      </DialogActions>
    </Dialog>
  );
};
