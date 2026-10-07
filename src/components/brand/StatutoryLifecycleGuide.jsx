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
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';

const STEPS = [
  { id: 1, key: 'draft', label: '1. Draft Mandate', desc: 'Client allocated & portfolio target set' },
  { id: 2, key: 'tax', label: '2. Tax Impact', desc: 'STCG, LTCG & Section 234B/C checked' },
  { id: 3, key: 'dispatch', label: '3. Dispatch Link', desc: 'Tokenized magic link sent to mobile' },
  { id: 4, key: 'review', label: '4. Client Review', desc: 'Investor reviewing in mobile view' },
  { id: 5, key: 'otp', label: '5. OTP Consent', desc: '6-digit OTP verified per Reg. 19' },
  { id: 6, key: 'dossier', label: '6. Reg. 19 Receipt', desc: 'Evidence locked; cleared to execute' },
];

export const StatutoryLifecycleGuide = ({
  status = 'draft',
  onDispatch,
  onShare,
  onViewDossier,
  dispatching = false,
  compact = false,
  overview = false,
}) => {
  const norm = (status || '').toLowerCase();

  // Determine current active step number (1 to 6)
  let currentStep = 1;
  if (norm === 'draft') currentStep = 2; // Drafted, needs review & dispatch
  else if (norm === 'sent') currentStep = 3; // Dispatched, waiting for view
  else if (norm === 'viewed') currentStep = 4; // Opened, pending OTP
  else if (norm === 'consented' || norm === 'approved') currentStep = 6; // Fully completed
  else if (norm === 'expired') currentStep = 4; // Stalled at review

  const getStepStatus = (stepId) => {
    if (overview) return 'overview';
    if (norm === 'expired') {
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
        title: 'Next Step: Review Pre-Computed Tax & Dispatch Proposal to Client',
        description: 'Verify the capital gains calculation below. When ready, dispatch the proposal link to generate the client-guarded mobile authorization rail.',
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
            {dispatching ? 'Dispatching...' : 'Dispatch Mandate to Client'}
          </Button>
        ) : null,
      };
    }
    if (norm === 'sent') {
      return {
        severity: 'warning',
        title: 'Next Step: Share Magic Link & Notify Client',
        description: 'Proposal link generated. Share with client via WhatsApp or secure email. Awaiting first client review within the 48-hour cutoff window.',
        action: onShare ? (
          <Button
            variant="contained"
            color="warning"
            size="small"
            startIcon={<ShareOutlinedIcon />}
            onClick={onShare}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Share / Copy Client Link
          </Button>
        ) : null,
      };
    }
    if (norm === 'viewed') {
      return {
        severity: 'info',
        title: 'Status: Client is Currently Reviewing Proposal',
        description: 'Client has opened the mobile proposal overview and is inspecting allocation changes and tax liabilities. Awaiting 6-digit Mobile OTP sign-off.',
        action: onShare ? (
          <Button
            variant="outlined"
            size="small"
            startIcon={<ShareOutlinedIcon />}
            onClick={onShare}
            sx={{ fontWeight: 600, borderRadius: 2 }}
          >
            Resend / Remind Client
          </Button>
        ) : null,
      };
    }
    if (norm === 'consented' || norm === 'approved') {
      return {
        severity: 'success',
        title: 'Status: Statutory Consent Verified & Clear for Trade Execution',
        description: 'Client has authorized the rebalancing mandate via Mobile OTP. Informed consent is committed to the append-only audit trail per SEBI Regulation 19.',
        action: onViewDossier ? (
          <Button
            variant="contained"
            color="success"
            size="small"
            startIcon={<ReceiptLongOutlinedIcon />}
            onClick={onViewDossier}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Download Regulation 19 Dossier
          </Button>
        ) : null,
      };
    }
    if (norm === 'expired') {
      return {
        severity: 'error',
        title: 'Cutoff Window Expired — Execution Stalled',
        description: 'The 48-hour cutoff window passed without client OTP authorization. Under non-discretionary rules, trades cannot be executed. Generate a fresh proposal.',
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
            {overview ? 'SEBI Regulation 19 Statutory Workflow Rail' : 'SEBI Regulation 19 Statutory Lifecycle Progress'}
          </Typography>
        </Box>
        <Chip
          label={overview ? '6 MANDATORY STATUTORY STAGES' : `CURRENT STAGE: ${norm.toUpperCase()}`}
          size="small"
          color={overview ? 'primary' : norm === 'consented' ? 'success' : norm === 'expired' ? 'error' : norm === 'draft' ? 'default' : 'primary'}
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
        {STEPS.map((step) => {
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
            Non-discretionary statutory flow required under SEBI (Investment Advisers) Regulations, 2013. Execution is legally locked until Stage 6.
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
