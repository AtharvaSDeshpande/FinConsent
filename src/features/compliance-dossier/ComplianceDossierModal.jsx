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
import { useI18n } from '../../i18n/I18nContext';

export const ComplianceDossierModal = ({ open, onClose, mandate, client, ria, auditLogs = [] }) => {
  const { t, formatCurrency, formatDateTime: ctxFormatDateTime, formatDate } = useI18n();
  const formatDateTime = typeof ctxFormatDateTime === 'function' ? ctxFormatDateTime : (typeof formatDate === 'function' ? formatDate : (d) => String(d || '—'));

  if (!mandate) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={700}>
          {t('dossier.title')}
        </Typography>
        <Chip
          icon={<CheckCircleIcon />}
          label={t('dossier.badge_certified')}
          color="success"
          size="small"
        />
      </DialogTitle>

      <DialogContent dividers sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Logo size={36} />
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="subtitle2" fontWeight={700}>
              {ria?.firmName || t('dossier.firm_fallback')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              {t('dossier.sebi_ina_label')} <strong>{ria?.sebiRegNumber}</strong>
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              {t('dossier.compliance_email_label')} {ria?.complianceEmail}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" fontWeight={700} gutterBottom>
          {mandate.title}
        </Typography>

        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, my: 2 }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {t('dossier.sec_identification')}
          </Typography>
          <Typography variant="body2">
            {t('dossier.client_name_label')} <strong>{client?.name}</strong> | {t('dossier.pan_label')} <strong>{client?.pan}</strong> | {t('dossier.mobile_label')} <strong>{client?.mobile}</strong>
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {t('dossier.mandate_status_label')} <strong>{mandate.status?.toUpperCase()}</strong> | {t('dossier.cutoff_label')} <strong>{formatDateTime(mandate.cutoffTimestamp)}</strong>
          </Typography>
        </Box>

        <Box sx={{ p: 2, border: 1, borderColor: 'warning.light', bgcolor: 'rgba(217, 119, 6, 0.05)', borderRadius: 2, my: 2 }}>
          <Typography variant="caption" fontWeight={700} color="warning.dark" sx={{ display: 'block', mb: 1 }}>
            {t('dossier.sec_tax_disclosure')}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body2">{t('dossier.stcg_label')} <strong>{formatCurrency(mandate.stcgAmount || 0)}</strong> ({t('dossier.tax_sub_label')} {formatCurrency(mandate.stcgTax || 0)})</Typography>
            <Typography variant="body2">{t('dossier.ltcg_label')} <strong>{formatCurrency(mandate.ltcgAmount || 0)}</strong> ({t('dossier.tax_sub_label')} {formatCurrency(mandate.ltcgTax || 0)})</Typography>
            <Typography variant="body2">{t('dossier.total_tax_payable')} <strong>{formatCurrency(mandate.taxPayable || 0)}</strong></Typography>
          </Box>
        </Box>

        <Box sx={{ my: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            {t('dossier.sec_audit_chronology')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {auditLogs.map((log, i) => (
              <Box key={i} sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {log.eventType} — {t('dossier.ip_label')} {log.ipAddress}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'JetBrains Mono', wordBreak: 'break-all' }}>
                    {t('dossier.digest_label')} {log.payloadHash?.slice(0, 32)}...
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ fontFamily: 'JetBrains Mono' }}>
                  {formatDateTime(log.timestamp)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          {t('dossier.statutory_footer_note')}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose}>{t('dossier.btn_close')}</Button>
        <Button
          variant="contained"
          startIcon={<PrintOutlinedIcon />}
          onClick={() => window.print()}
        >
          {t('dossier.btn_print')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
