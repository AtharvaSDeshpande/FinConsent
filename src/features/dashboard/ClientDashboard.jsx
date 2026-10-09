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
import { useI18n } from '../../i18n/I18nContext.jsx';
import { formatCurrency, formatDate } from '../../i18n/formatters.js';

export const ClientDashboard = ({ user, mandates = [], loading = false, error = null }) => {
  const navigate = useNavigate();
  const { t } = useI18n();

  // Filter client's pending items vs completed archive
  const pendingMandates = mandates.filter((m) => m.status === 'sent' || m.status === 'viewed' || m.status === 'draft');
  const consentedMandates = mandates.filter((m) => m.status === 'consented' || m.status === 'approved');

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2.5, md: 4 } }}>
      {/* 1. Welcoming Investor Trust Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
          <Typography variant="h4" component="h1" fontWeight={800} letterSpacing="-0.025em" color="#0F172A">
            {t('dashboard.client_welcome', { name: user?.name || 'Valued Investor' })}
          </Typography>
          <Chip
            icon={<ShieldOutlinedIcon sx={{ fontSize: '15px !important', color: '#047857' }} />}
            label={t('dashboard.client_account_badge')}
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
          {t('dashboard.client_dashboard_desc')}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }}>{error}</Alert>}

      {/* 2. PRIORITY 1: ACTIONS REQUIRING ATTENTION */}
      <Box sx={{ mb: 4.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" fontWeight={800} color="#0F172A">
              {t('dashboard.client_pending_heading')}
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
                <Grid item xs={12} size={{ xs: 12 }} key={m.id}>
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
                            {t('dashboard.client_action_required')}
                          </Typography>
                          {diffHours !== null && (
                            <Chip
                              icon={<AccessTimeOutlinedIcon sx={{ fontSize: '13px !important' }} />}
                              label={t('dashboard.client_hours_remaining', { hours: diffHours })}
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
                          {t('dashboard.client_prepared_by')} <strong>{m.riaFirmName || 'Advisory Firm'}</strong> (SEBI INA: {m.riaSebiReg || 'INA000088921'})
                        </Typography>
                      </Box>

                      {/* Prominent Primary Review Action */}
                      <Button
                        variant="contained"
                        size="large"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => {
                          if (m.magicToken) {
                            navigate(`/m/${m.magicToken}`);
                          } else {
                            navigate(`/mandates/${m.id}`);
                          }
                        }}
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
                        {t('dashboard.client_btn_review_auth')}
                      </Button>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={650}>
                          {t('dashboard.client_proposed_mix')}
                        </Typography>
                        <Typography variant="body2" fontWeight={750} color="#0F172A" sx={{ mt: 0.3 }}>
                          {t('mandate.equity')}: {m.proposedAllocation?.equity || 60}% • {t('mandate.debt')}: {m.proposedAllocation?.debt || 25}% • {t('mandate.gold')}: {m.proposedAllocation?.gold || 10}%
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={650}>
                          {t('dashboard.client_precomputed_tax')}
                        </Typography>
                        <Typography variant="body2" fontWeight={800} color="#4F46E5" sx={{ mt: 0.3 }}>
                          {formatCurrency(m.taxPayable || 0)} (FY 2026-27)
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={650}>
                          {t('dashboard.client_statutory_safeguard')}
                        </Typography>
                        <Typography variant="body2" fontWeight={650} color="#059669" sx={{ mt: 0.3, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
                          {t('dashboard.client_otp_required_label')}
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
              {t('dashboard.client_all_clear_title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', lineHeight: 1.6 }}>
              {t('dashboard.client_all_clear_desc')}
            </Typography>
          </Card>
        )}
      </Box>

      {/* 3. PRIORITY 2: HISTORICAL AUTHORIZATIONS & STATUTORY RECEIPTS */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 2 }}>
          {t('dashboard.client_archive_title', { count: consentedMandates.length })}
        </Typography>

        {consentedMandates.length === 0 ? (
          <Card elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {t('dashboard.client_no_archive')}
            </Typography>
          </Card>
        ) : (
          <Card elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{t('dashboard.client_th_proposal')}</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{t('dashboard.client_th_adviser')}</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{t('dashboard.client_th_tax')}</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{t('dashboard.client_th_status')}</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }} align="center">{t('dashboard.client_th_receipt')}</TableCell>
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
                          {t('dashboard.client_authorized_on', { date: formatDate(m.updatedAt || m.createdAt) })}
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
                          {formatCurrency(m.taxPayable || 0)}
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
                          onClick={() => {
                            if (m.magicToken) {
                              navigate(`/m/${m.magicToken}/receipt`);
                            } else {
                              navigate(`/mandates/${m.id}`);
                            }
                          }}
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
                          {t('dashboard.client_btn_view_cert')}
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
        <Grid item xs={12} md={7} size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#F8FAFC', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}>
              <VerifiedUserOutlinedIcon sx={{ color: '#0F172A', fontSize: 22 }} />
              <Typography variant="subtitle1" fontWeight={750} color="#0F172A">
                {t('dashboard.client_rights_title')}
              </Typography>
            </Box>
            <Stack spacing={1.2}>
              <Typography variant="caption" color="#334155" sx={{ display: 'block', lineHeight: 1.5 }}>
                • {t('dashboard.client_right_1')}
              </Typography>
              <Typography variant="caption" color="#334155" sx={{ display: 'block', lineHeight: 1.5 }}>
                • {t('dashboard.client_right_2')}
              </Typography>
              <Typography variant="caption" color="#334155" sx={{ display: 'block', lineHeight: 1.5 }}>
                • {t('dashboard.client_right_3')}
              </Typography>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={5} size={{ xs: 12, md: 5 }}>
          <Card elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1 }}>
                <HelpOutlineOutlinedIcon sx={{ color: '#4F46E5', fontSize: 22 }} />
                <Typography variant="subtitle1" fontWeight={750} color="#0F172A">
                  {t('dashboard.client_question_title')}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
                {t('dashboard.client_question_desc')}
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
              {t('dashboard.client_btn_submit_inquiry')}
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ClientDashboard;
