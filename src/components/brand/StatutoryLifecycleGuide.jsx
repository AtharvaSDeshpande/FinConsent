import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { useI18n } from '../../i18n/I18nContext.jsx';

export const StatutoryLifecycleGuide = ({
  status = 'draft',
  onDispatch,
  onShare,
  onViewDossier,
  dispatching = false,
  compact = false,
  overview = false,
}) => {
  const { t } = useI18n();
  const norm = (status || '').toLowerCase();

  const steps = [
    { id: 1, key: 'draft', label: t('guide.step1_label'), desc: t('guide.step1_desc') },
    { id: 2, key: 'tax', label: t('guide.step2_label'), desc: t('guide.step2_desc') },
    { id: 3, key: 'dispatch', label: t('guide.step3_label'), desc: t('guide.step3_desc') },
    { id: 4, key: 'review', label: t('guide.step4_label'), desc: t('guide.step4_desc') },
    { id: 5, key: 'otp', label: t('guide.step5_label'), desc: t('guide.step5_desc') },
    { id: 6, key: 'dossier', label: t('guide.step6_label'), desc: t('guide.step6_desc') },
  ];

  // Determine current active step number (1 to 6)
  let currentStep = 1;
  if (norm === 'draft') currentStep = 2; // Drafted, needs review & dispatch
  else if (norm === 'sent') currentStep = 3; // Dispatched, waiting for view
  else if (norm === 'viewed') currentStep = 4; // Opened, pending OTP
  else if (norm === 'consented' || norm === 'approved') currentStep = 6; // Fully completed
  else if (norm === 'expired') currentStep = 4; // Stalled at review
  else if (norm === 'revoked') currentStep = 4; // Revoked

  const getStepStatus = (stepId) => {
    if (overview) return 'overview';
    if (norm === 'expired' || norm === 'revoked') {
      if (stepId <= 3) return 'completed';
      if (stepId === 4) return 'expired';
      return 'pending';
    }
    if (norm === 'consented' || norm === 'approved') {
      return 'completed';
    }
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'active';
    return 'pending';
  };

  const getActionBanner = () => {
    if (norm === 'draft') {
      return {
        severity: 'info',
        title: t('guide.banner_draft_title'),
        description: t('guide.banner_draft_desc'),
        action: onDispatch ? (
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<SendOutlinedIcon />}
            onClick={onDispatch}
            disabled={dispatching}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            {dispatching ? t('common.loading') : t('guide.btn_dispatch')}
          </Button>
        ) : null,
      };
    }
    if (norm === 'sent') {
      return {
        severity: 'warning',
        title: t('guide.banner_sent_title'),
        description: t('guide.banner_sent_desc'),
        action: onShare ? (
          <Button
            variant="contained"
            color="warning"
            size="small"
            startIcon={<ShareOutlinedIcon />}
            onClick={onShare}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            {t('guide.btn_share_client_link')}
          </Button>
        ) : null,
      };
    }
    if (norm === 'viewed') {
      return {
        severity: 'info',
        title: t('guide.banner_viewed_title'),
        description: t('guide.banner_viewed_desc'),
        action: onShare ? (
          <Button
            variant="outlined"
            size="small"
            startIcon={<ShareOutlinedIcon />}
            onClick={onShare}
            sx={{ fontWeight: 600, borderRadius: 2 }}
          >
            {t('guide.btn_remind_client')}
          </Button>
        ) : null,
      };
    }
    if (norm === 'consented' || norm === 'approved') {
      return {
        severity: 'success',
        title: t('guide.banner_approved_title'),
        description: t('guide.banner_approved_desc'),
        action: onViewDossier ? (
          <Button
            variant="contained"
            color="success"
            size="small"
            startIcon={<ReceiptLongOutlinedIcon />}
            onClick={onViewDossier}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            {t('guide.btn_download_dossier')}
          </Button>
        ) : null,
      };
    }
    if (norm === 'expired') {
      return {
        severity: 'error',
        title: t('guide.banner_expired_title'),
        description: t('guide.banner_expired_desc'),
        action: null,
      };
    }
    if (norm === 'revoked') {
      return {
        severity: 'error',
        title: 'Mandate Revoked',
        description: 'This advisory mandate has been revoked and is void for execution or consent.',
        action: null,
      };
    }
    return null;
  };

  const banner = overview ? null : getActionBanner();

  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        mb: 3,
        borderRadius: 3,
        bgcolor: '#FFFFFF',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VerifiedUserOutlinedIcon color="primary" sx={{ fontSize: 20 }} />
          <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
            {overview ? 'SEBI Regulation 19 Compliance Lifecycle Rail' : 'SEBI Regulation 19 Compliance Lifecycle Progress'}
          </Typography>
        </Box>
        <Chip
          label={overview ? '6 STATUTORY COMPLIANCE STAGES' : `CURRENT STAGE: ${(t(`status.${norm}`) || norm).toUpperCase()}`}
          size="small"
          color={overview ? 'primary' : norm === 'consented' ? 'success' : (norm === 'expired' || norm === 'revoked') ? 'error' : norm === 'draft' ? 'default' : 'primary'}
          sx={{ fontWeight: 750, fontSize: '0.68rem' }}
        />
      </Box>

      {/* Stepper Track */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' },
          gap: 1.5,
          mb: banner || overview ? 2 : 0,
        }}
      >
        {steps.map((step) => {
          const stepStatus = getStepStatus(step.id);
          const isDone = stepStatus === 'completed';
          const isActive = stepStatus === 'active';
          const isExp = stepStatus === 'expired';
          const isOverview = stepStatus === 'overview';

          return (
            <Box
              key={step.id}
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: isOverview
                  ? 'rgba(241, 245, 249, 0.7)'
                  : isDone
                  ? 'rgba(16, 185, 129, 0.06)'
                  : isActive
                  ? 'rgba(79, 70, 229, 0.08)'
                  : isExp
                  ? 'rgba(239, 68, 68, 0.06)'
                  : 'rgba(241, 245, 249, 0.6)',
                border: '1px solid',
                borderColor: isOverview
                  ? '#CBD5E1'
                  : isDone
                  ? 'rgba(16, 185, 129, 0.3)'
                  : isActive
                  ? '#6366F1'
                  : isExp
                  ? 'rgba(239, 68, 68, 0.3)'
                  : 'rgba(226, 232, 240, 0.8)',
                transition: 'all 0.2s',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                {isOverview ? (
                  <CheckCircleRoundedIcon sx={{ fontSize: 16, color: '#4F46E5' }} />
                ) : isDone ? (
                  <CheckCircleRoundedIcon sx={{ fontSize: 16, color: '#10B981' }} />
                ) : isActive ? (
                  <HourglassTopIcon sx={{ fontSize: 16, color: '#4F46E5' }} />
                ) : isExp ? (
                  <WarningAmberOutlinedIcon sx={{ fontSize: 16, color: '#EF4444' }} />
                ) : (
                  <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
                )}
                <Typography
                  variant="caption"
                  fontWeight={isOverview || isActive ? 800 : isDone ? 700 : 600}
                  color={isOverview ? '#1E293B' : isActive ? '#4F46E5' : isDone ? '#065F46' : isExp ? '#991B1B' : '#64748B'}
                  noWrap
                >
                  {step.label}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.68rem', lineHeight: 1.3, display: 'block' }}>
                {step.desc}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {overview && (
        <Box sx={{ px: 1, pt: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.74rem' }}>
            Non-discretionary advisory record workflow aligned with SEBI (Investment Advisers) Regulations, 2013 Regulation 19 record-keeping requirements. Execution requires prior documented client consent.
          </Typography>
        </Box>
      )}

      {/* Recommended Next Action Banner */}
      {banner && (
        <Box
          sx={{
            p: 2,
            borderRadius: 2.5,
            bgcolor:
              banner.severity === 'success'
                ? 'rgba(16, 185, 129, 0.08)'
                : banner.severity === 'warning'
                ? 'rgba(245, 158, 11, 0.08)'
                : banner.severity === 'error'
                ? 'rgba(239, 68, 68, 0.08)'
                : 'rgba(79, 70, 229, 0.06)',
            border: '1px solid',
            borderColor:
              banner.severity === 'success'
                ? 'rgba(16, 185, 129, 0.3)'
                : banner.severity === 'warning'
                ? 'rgba(245, 158, 11, 0.3)'
                : banner.severity === 'error'
                ? 'rgba(239, 68, 68, 0.3)'
                : 'rgba(79, 70, 229, 0.25)',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 1.5,
          }}
        >
          <Box>
            <Typography
              variant="body2"
              fontWeight={750}
              color={
                banner.severity === 'success'
                  ? '#065F46'
                  : banner.severity === 'warning'
                  ? '#92400E'
                  : banner.severity === 'error'
                  ? '#991B1B'
                  : '#1E1B4B'
              }
            >
              {banner.title}
            </Typography>
            <Typography variant="caption" sx={{ color: '#475569', mt: 0.3, display: 'block' }}>
              {banner.description}
            </Typography>
          </Box>
          {banner.action && <Box sx={{ flexShrink: 0 }}>{banner.action}</Box>}
        </Box>
      )}
    </Card>
  );
};

export default StatutoryLifecycleGuide;
