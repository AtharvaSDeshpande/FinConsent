import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import SendIcon from '@mui/icons-material/Send';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useI18n } from '../../i18n/I18nContext';

export const MandateChat = ({
  mode = 'client', // 'client' or 'advisor'
  token, // client public token
  mandateId, // advisor mandate id
  unlockToken, // client unlock token
  clientName = 'Investor',
  advisorName = 'Investment Adviser',
  firmName = 'Advisory Practice',
}) => {
  const { t, formatTime: ctxFormatTime, formatDate } = useI18n();
  const formatTime = typeof ctxFormatTime === 'function' ? ctxFormatTime : (typeof formatDate === 'function' ? formatDate : (ts) => String(ts || ''));
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChat = async () => {
    try {
      let url;
      let headers = {};

      if (mode === 'client') {
        if (!token) return;
        const savedToken = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(`finconsent_unlock_${token}`) : null;
        const effectiveUnlockToken = unlockToken || savedToken;
        if (!effectiveUnlockToken) return; // Defer polling until mandate is unlocked by client
        url = `/api/public/mandates/${token}/chat`;
        headers['x-unlock-token'] = effectiveUnlockToken;
      } else {
        if (!mandateId) return;
        url = `/api/mandates/${mandateId}/chat`;
        const authToken = localStorage.getItem('finconsent_token');
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }
      }

      const res = await fetch(url, { headers });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessages(data.data || []);
      } else if (!res.ok) {
        // Don't show critical error on polling if temporarily locked
        if (res.status === 403 || res.status === 401) {
          setError('Chat access requires unlocked mandate verification.');
        }
      }
    } catch (err) {
      console.warn('[Chat load error]', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChat();
    // Subtle auto-refresh every 10 seconds for real-time responsiveness
    const timer = setInterval(fetchChat, 10000);
    return () => clearInterval(timer);
  }, [token, mandateId, unlockToken, mode]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;
    if (text.length > 500) {
      setError(t('chat.char_limit_error'));
      return;
    }

    setError('');
    setSending(true);

    try {
      let url;
      let headers = { 'Content-Type': 'application/json' };
      let body = { message: text };

      if (mode === 'client') {
        url = `/api/public/mandates/${token}/chat`;
        const savedToken = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(`finconsent_unlock_${token}`) : null;
        const effectiveUnlockToken = unlockToken || savedToken;
        if (effectiveUnlockToken) {
          headers['x-unlock-token'] = effectiveUnlockToken;
          body.unlockToken = effectiveUnlockToken;
        }
      } else {
        url = `/api/mandates/${mandateId}/chat`;
        const authToken = localStorage.getItem('finconsent_token');
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }
      }

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to send message');
      }

      setInputText('');
      setMessages((prev) => [...prev, result.data]);
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const QUICK_QUESTIONS = [
    t('chat.quick_q1'),
    t('chat.quick_q2'),
    t('chat.quick_q3'),
  ];

  return (
    <Card
      id="mandate_chat_section"
      elevation={0}
      sx={{
        borderRadius: 3.5,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
        mb: 3,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          bgcolor: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Box
            sx={{
              p: 0.8,
              borderRadius: 2,
              bgcolor: 'rgba(79, 70, 229, 0.1)',
              color: '#4F46E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <QuestionAnswerOutlinedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={750} color="#0F172A">
              {mode === 'client' ? t('chat.client_title') : t('chat.trail_title')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {mode === 'client'
                ? t('chat.client_sub', { advisorName, firmName })
                : t('chat.advisor_sub', { clientName })}
            </Typography>
          </Box>
        </Box>
        <Chip
          icon={<ShieldOutlinedIcon sx={{ fontSize: '13px !important' }} />}
          label={t('chat.trail_badge')}
          size="small"
          sx={{
            fontSize: '0.72rem',
            fontWeight: 650,
            bgcolor: '#EEF2FF',
            color: '#4338CA',
            border: '1px solid rgba(99, 102, 241, 0.2)',
          }}
        />
      </Box>

      {/* Statutory Clarification Notice */}
      <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 1.2, bgcolor: '#FFFBEB', borderBottom: '1px solid #FEF3C7' }}>
        <Typography variant="caption" sx={{ color: '#92400E', display: 'flex', alignItems: 'center', gap: 0.8, fontWeight: 550, fontSize: '0.74rem' }}>
          <InfoOutlinedIcon sx={{ fontSize: 15, flexShrink: 0 }} />
          <span>
            <strong>{t('chat.statutory_rule_badge')}</strong> {t('chat.statutory_rule_text')}
          </span>
        </Typography>
      </Box>

      {/* Messages Scroll Area */}
      <Box
        id="mandate_chat_messages"
        sx={{
          p: { xs: 2, sm: 2.5 },
          maxHeight: 320,
          minHeight: 180,
          overflowY: 'auto',
          bgcolor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {loading && messages.length === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4, gap: 1 }}>
            <CircularProgress size={20} color="primary" />
            <Typography variant="body2" color="text.secondary">
              {t('chat.loading_trail')}
            </Typography>
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2" sx={{ fontStyle: 'italic', fontSize: '0.86rem' }}>
              {t('chat.empty_trail_title')}
            </Typography>
            {mode === 'client' && (
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#64748B' }}>
                {t('chat.empty_trail_sub')}
              </Typography>
            )}
          </Box>
        ) : (
          messages.map((m, idx) => {
            const isMe = mode === 'client' ? m.sender === 'client' : m.sender === 'ria';
            const isAdvisorMessage = m.sender === 'ria';
            return (
              <Box
                key={m.id || idx}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '100%',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.6,
                    mb: 0.3,
                    px: 0.5,
                  }}
                >
                  {isAdvisorMessage ? (
                    <SupportAgentOutlinedIcon sx={{ fontSize: 13, color: '#4F46E5' }} />
                  ) : (
                    <PersonOutlineOutlinedIcon sx={{ fontSize: 13, color: '#64748B' }} />
                  )}
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.72rem', color: isAdvisorMessage ? '#4338CA' : '#475569' }}>
                    {m.senderName || (isAdvisorMessage ? t('chat.sender_adviser') : t('chat.sender_client'))}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                    • {formatTime(m.timestamp || Date.now())}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    maxWidth: { xs: '90%', sm: '78%' },
                    p: 1.5,
                    borderRadius: 2.5,
                    borderTopRightRadius: isMe ? 0.5 : 2.5,
                    borderTopLeftRadius: isMe ? 2.5 : 0.5,
                    bgcolor: isMe ? '#4F46E5' : '#F1F5F9',
                    color: isMe ? '#FFFFFF' : '#0F172A',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <Typography variant="body2" sx={{ fontSize: '0.86rem', lineHeight: 1.5, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                    {m.message}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Suggested Quick Questions (Client Mode) */}
      {mode === 'client' && (
        <Box sx={{ px: { xs: 2, sm: 2.5 }, pb: 1, pt: 0.5, display: 'flex', gap: 0.8, flexWrap: 'wrap', bgcolor: '#F8FAFC' }}>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600, width: '100%' }}>
            {t('chat.suggested_questions_label')}
          </Typography>
          {QUICK_QUESTIONS.map((q) => (
            <Chip
              key={q}
              label={q}
              size="small"
              onClick={() => handleSend(q)}
              clickable
              sx={{
                fontSize: '0.73rem',
                bgcolor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                '&:hover': { bgcolor: '#EEF2FF', borderColor: '#818CF8' },
              }}
            />
          ))}
        </Box>
      )}

      {error && (
        <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 1 }}>
          <Alert severity="error" sx={{ fontSize: '0.8rem', py: 0 }}>
            {error}
          </Alert>
        </Box>
      )}

      {/* Message Input Box */}
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        sx={{
          p: { xs: 1.5, sm: 2 },
          bgcolor: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <TextField
          id="mandate_chat_input"
          fullWidth
          size="small"
          placeholder={mode === 'client' ? t('chat.client_placeholder') : t('chat.advisor_placeholder')}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={sending}
          inputProps={{ maxLength: 500 }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#FFFFFF',
              borderRadius: 2,
              fontSize: '0.88rem',
            },
          }}
        />
        <Button
          id="mandate_chat_send_btn"
          type="submit"
          variant="contained"
          disabled={sending || !inputText.trim()}
          startIcon={sending ? <CircularProgress size={16} color="inherit" /> : <SendIcon sx={{ fontSize: 16 }} />}
          sx={{
            py: 1,
            px: 2.5,
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: 2,
            bgcolor: '#4F46E5',
            '&:hover': { bgcolor: '#4338CA' },
            flexShrink: 0,
          }}
        >
          {sending ? t('chat.btn_sending_short') : t('chat.btn_send_short')}
        </Button>
      </Box>
    </Card>
  );
};

export default MandateChat;
