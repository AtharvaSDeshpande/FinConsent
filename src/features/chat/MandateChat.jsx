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
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { useI18n } from '../../i18n/I18nContext';

const decodeHtmlEntities = (text) => {
  if (typeof text !== 'string') return text;
  return text
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
};

export const MandateChat = ({
  mode = 'client', // 'client' or 'advisor'
  token, // client public token
  mandateId, // advisor mandate id
  unlockToken, // client unlock token
  clientName = 'Investor',
  advisorName = 'Investment Adviser',
  firmName = 'Advisory Practice',
  status,
  isExpired = false,
  isRevoked = false,
  isConsented = false,
  isLocked = false,
}) => {
  const { t, formatTime: ctxFormatTime, formatDate } = useI18n();
  const formatTime = typeof ctxFormatTime === 'function' ? ctxFormatTime : (typeof formatDate === 'function' ? formatDate : (ts) => String(ts || ''));
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [checkingProposal, setCheckingProposal] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [escalatedKeys, setEscalatedKeys] = useState({});
  const [escalateSuccessMsg, setEscalateSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const canInteract = mode === 'advisor' || (!isExpired && !isRevoked && !isConsented && !isLocked && status !== 'expired' && status !== 'revoked' && status !== 'consented' && status !== 'approved');

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
    const timer = setInterval(fetchChat, 10000);
    return () => clearInterval(timer);
  }, [token, mandateId, unlockToken, mode]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, checkingProposal]);

  const findRelatedQuestion = (assistantIdx) => {
    const astMsg = messages[assistantIdx];
    if (astMsg?.metadata?.relatedQuestion) {
      return astMsg.metadata.relatedQuestion;
    }
    for (let i = assistantIdx - 1; i >= 0; i--) {
      if (messages[i]?.sender === 'client' && messages[i]?.message) {
        return messages[i].message;
      }
    }
    return inputText.trim() || '';
  };

  const handleEscalate = async ({ questionText, assistantReplyText, messageId, key }) => {
    if (!canInteract || mode !== 'client') return;
    const effectiveQuestion = (questionText || inputText || '').trim();
    if (!effectiveQuestion) {
      setError(t('chat.input_placeholder') || 'Please enter or select a question to escalate.');
      return;
    }

    const escalationKey = key || messageId || effectiveQuestion;
    if (escalatedKeys[escalationKey]) return;

    setEscalating(true);
    setError('');
    setEscalateSuccessMsg('');

    try {
      const savedToken = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(`finconsent_unlock_${token}`) : null;
      const effectiveUnlockToken = unlockToken || savedToken;

      const res = await fetch(`/api/public/mandates/${token}/escalate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(effectiveUnlockToken ? { 'x-unlock-token': effectiveUnlockToken } : {}),
        },
        body: JSON.stringify({
          question: effectiveQuestion,
          assistantReply: assistantReplyText || '',
          messageId,
          unlockToken: effectiveUnlockToken,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to escalate to adviser');
      }

      setEscalatedKeys((prev) => ({
        ...prev,
        [escalationKey]: true,
        [effectiveQuestion]: true,
        ...(messageId ? { [messageId]: true } : {}),
      }));

      const confirmationText = t('chat.escalate_confirm', { adviserName: advisorName, advisorName, firmName }) || `Sent to ${advisorName}. They will reply here`;
      setEscalateSuccessMsg(confirmationText);
      setInputText('');

      await fetchChat();
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      setError(err.message || 'Failed to escalate question to adviser');
    } finally {
      setEscalating(false);
    }
  };

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;
    if (text.length > 500) {
      setError(t('chat.char_limit_error'));
      return;
    }

    setError('');
    setSending(true);
    setInputText('');

    if (mode === 'client') {
      const savedToken = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(`finconsent_unlock_${token}`) : null;
      const effectiveUnlockToken = unlockToken || savedToken;

      setCheckingProposal(true);
      try {
        const res = await fetch(`/api/public/mandates/${token}/assistant`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(effectiveUnlockToken ? { 'x-unlock-token': effectiveUnlockToken } : {}),
          },
          body: JSON.stringify({ question: text, unlockToken: effectiveUnlockToken }),
        });

        const result = await res.json();
        if (res.status === 429) {
          setInputText(text); // Retain user typed question
          const waitTimeMsg = result.retryAfter
            ? `Rate limit reached. Please wait ${result.retryAfter} seconds before asking another question.`
            : (result.error || t('chat.assistant_rate_limit') || 'Rate limit reached. Please wait before asking another question.');
          setError(waitTimeMsg);
          return;
        }

        if (res.status === 503 || result.isCapacityError || (result.error && /capacity|quota|503|resource_exhausted/i.test(result.error))) {
          setInputText(text); // Retain user typed question
          setError(
            result.error ||
              'The assistant is temporarily at capacity. Please wait a moment and try again.'
          );
          return;
        }

        if (res.ok && result.success) {
          await fetchChat();
          setTimeout(scrollToBottom, 50);
          return;
        }

        // If assistant failed or returned non-200, fallback to standard human chat
        console.warn('[Assistant route fallback]', result.error);
        const fallbackRes = await fetch(`/api/public/mandates/${token}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(effectiveUnlockToken ? { 'x-unlock-token': effectiveUnlockToken } : {}),
          },
          body: JSON.stringify({ message: text, unlockToken: effectiveUnlockToken }),
        });
        const fallbackData = await fallbackRes.json();
        if (fallbackRes.ok && fallbackData.success) {
          setMessages((prev) => [...prev, fallbackData.data]);
        } else {
          setError(fallbackData.error || 'Failed to send message');
        }
      } catch (err) {
        console.warn('[Assistant request error, trying standard chat]', err.message);
        if (/capacity|quota|503/i.test(err.message)) {
          setInputText(text);
          setError('The assistant is temporarily at capacity. Please wait a moment and try again.');
          return;
        }
        try {
          const fallbackRes = await fetch(`/api/public/mandates/${token}/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(effectiveUnlockToken ? { 'x-unlock-token': effectiveUnlockToken } : {}),
            },
            body: JSON.stringify({ message: text, unlockToken: effectiveUnlockToken }),
          });
          const fallbackData = await fallbackRes.json();
          if (fallbackRes.ok && fallbackData.success) {
            setMessages((prev) => [...prev, fallbackData.data]);
          } else {
            setError(fallbackData.error || err.message);
          }
        } catch (fbErr) {
          setError(fbErr.message);
        }
      } finally {
        setCheckingProposal(false);
        setSending(false);
        setTimeout(scrollToBottom, 50);
      }
    } else {
      // Advisor mode: standard human post
      try {
        const authToken = localStorage.getItem('finconsent_token');
        const headers = { 'Content-Type': 'application/json' };
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

        const res = await fetch(`/api/mandates/${mandateId}/chat`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ message: text }),
        });
        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.error || 'Failed to send message');
        }
        setMessages((prev) => [...prev, result.data]);
        setTimeout(scrollToBottom, 50);
      } catch (err) {
        setError(err.message);
      } finally {
        setSending(false);
      }
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
                ? t('chat.client_sub', { adviserName: advisorName, advisorName, firmName })
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

      {/* Clarification Notice */}
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
        ) : messages.length === 0 && !checkingProposal ? (
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
            const isAssistant = m.sender === 'assistant' || m.isAssistant;
            const isEscalatedClient = Boolean(m.isEscalated || m.escalated || m.tag === 'Escalated from assistant');

            if (isAssistant) {
              const qText = m.metadata?.relatedQuestion || findRelatedQuestion(idx);
              const isThisEscalated =
                Boolean(escalatedKeys[m.id]) ||
                Boolean(escalatedKeys[qText]) ||
                (m.metadata?.relatedQuestionId && Boolean(escalatedKeys[m.metadata.relatedQuestionId])) ||
                messages.some(
                  (msg) =>
                    msg.sender === 'client' &&
                    (msg.isEscalated || msg.escalated) &&
                    (msg.message === qText || msg.id === m.metadata?.relatedQuestionId)
                );

              const isHandoffOrFallback = Boolean(m.handoff || m.metadata?.handoff);

              return (
                <Box
                  key={m.id || idx}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    maxWidth: '100%',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.6,
                      mb: 0.4,
                      px: 0.5,
                    }}
                  >
                    <AutoAwesomeOutlinedIcon sx={{ fontSize: 13, color: '#4F46E5' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#4338CA' }}>
                      {mode === 'advisor' ? (t('chat.sender_assistant_short') || 'Assistant') : (t('chat.sender_assistant') || 'Consent Clarity Assistant')}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                      • {formatTime(m.timestamp || Date.now())}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      maxWidth: { xs: '95%', sm: '85%' },
                      p: 1.8,
                      borderRadius: 2.5,
                      borderTopLeftRadius: 0.5,
                      bgcolor: '#F8FAFC',
                      border: '1.5px solid #C7D2FE',
                      boxShadow: '0 2px 8px rgba(79, 70, 229, 0.05)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1, pb: 0.8, borderBottom: '1px solid #E2E8F0', flexWrap: 'wrap' }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.73rem', color: '#4338CA', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AutoAwesomeOutlinedIcon sx={{ fontSize: 13 }} />
                        {t('chat.assistant_badge')}
                      </Typography>
                      {m.handoff && (
                        <Chip
                          label={t('chat.assistant_handoff_tag')}
                          size="small"
                          sx={{
                            fontSize: '0.68rem',
                            height: 20,
                            fontWeight: 700,
                            bgcolor: '#FEF3C7',
                            color: '#92400E',
                            border: '1px solid #FDE68A',
                          }}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ color: '#0F172A', fontSize: '0.86rem', lineHeight: 1.55, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                      {decodeHtmlEntities(m.message)}
                    </Typography>

                    {/* Escalate button under assistant reply */}
                    {mode === 'client' && canInteract && (
                      <Box sx={{ mt: 1.5, pt: 1, borderTop: '1px dashed #E2E8F0', display: 'flex', alignItems: 'center' }}>
                        {isHandoffOrFallback ? (
                          <Button
                            id={`btn_escalate_${m.id || idx}`}
                            variant="contained"
                            size="medium"
                            disabled={isThisEscalated || escalating}
                            onClick={() =>
                              handleEscalate({
                                questionText: qText,
                                assistantReplyText: m.message,
                                messageId: m.metadata?.relatedQuestionId,
                                key: m.id || idx,
                              })
                            }
                            startIcon={
                              escalating ? (
                                <CircularProgress size={16} color="inherit" />
                              ) : (
                                <SupportAgentOutlinedIcon sx={{ fontSize: 18 }} />
                              )
                            }
                            sx={{
                              minHeight: 44,
                              fontWeight: 700,
                              borderRadius: 2,
                              fontSize: '0.84rem',
                              textTransform: 'none',
                              px: 2.5,
                              py: 1,
                              bgcolor: '#F59E0B',
                              color: '#FFFFFF',
                              boxShadow: 'none',
                              '&:hover': { bgcolor: '#D97706' },
                              '&.Mui-disabled': {
                                bgcolor: isThisEscalated ? '#ECFDF5' : '#E2E8F0',
                                color: isThisEscalated ? '#047857' : '#94A3B8',
                                border: isThisEscalated ? '1px solid #A7F3D0' : 'none',
                              },
                            }}
                          >
                            {isThisEscalated
                              ? (t('chat.escalate_confirm', { adviserName: advisorName, advisorName, firmName }) || `Sent to ${advisorName}. They will reply here`)
                              : (t('chat.btn_escalate', { adviserName: advisorName, advisorName, firmName }) || `Escalate to ${advisorName}`)}
                          </Button>
                        ) : (
                          <Button
                            id={`btn_escalate_sm_${m.id || idx}`}
                            variant="text"
                            size="small"
                            disabled={isThisEscalated || escalating}
                            onClick={() =>
                              handleEscalate({
                                questionText: qText,
                                assistantReplyText: m.message,
                                messageId: m.metadata?.relatedQuestionId,
                                key: m.id || idx,
                              })
                            }
                            startIcon={<SupportAgentOutlinedIcon sx={{ fontSize: 15 }} />}
                            sx={{
                              minHeight: 36,
                              fontWeight: 650,
                              fontSize: '0.76rem',
                              textTransform: 'none',
                              px: 1.2,
                              py: 0.5,
                              color: isThisEscalated ? '#047857' : '#4F46E5',
                              '&:hover': { bgcolor: 'rgba(79, 70, 229, 0.08)' },
                              '&.Mui-disabled': {
                                color: isThisEscalated ? '#047857' : '#94A3B8',
                              },
                            }}
                          >
                            {isThisEscalated
                              ? (t('chat.escalate_confirm', { adviserName: advisorName, advisorName, firmName }) || `Sent to ${advisorName}. They will reply here`)
                              : (t('chat.btn_escalate', { adviserName: advisorName, advisorName, firmName }) || `Escalate to ${advisorName}`)}
                          </Button>
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            }

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
                  {isEscalatedClient && (
                    <Chip
                      id={`msg_escalated_chip_${m.id || idx}`}
                      label={t('chat.escalated_badge') || 'Escalated'}
                      size="small"
                      sx={{
                        fontSize: '0.66rem',
                        height: 18,
                        fontWeight: 750,
                        bgcolor: '#FEF3C7',
                        color: '#92400E',
                        border: '1px solid #FDE68A',
                      }}
                    />
                  )}
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
                  <Typography variant="body2" sx={{ color: isMe ? '#FFFFFF' : '#0F172A', fontSize: '0.86rem', lineHeight: 1.5, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                    {decodeHtmlEntities(m.message)}
                  </Typography>
                  {m.relatedReply && (
                    <Box
                      sx={{
                        mt: 0.8,
                        p: 1,
                        bgcolor: isMe ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.04)',
                        borderRadius: 1.5,
                        borderLeft: '3px solid #F59E0B',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontStyle: 'italic',
                          display: 'block',
                          fontSize: '0.72rem',
                          color: isMe ? 'rgba(255,255,255,0.92)' : '#64748B',
                        }}
                      >
                        {t('chat.escalated_tag') || 'Escalated from assistant'}: "{decodeHtmlEntities(m.relatedReply.length > 100 ? m.relatedReply.slice(0, 100) + '...' : m.relatedReply)}"
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })
        )}

        {checkingProposal && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              p: 1.2,
              px: 2,
              borderRadius: 2,
              bgcolor: '#EEF2FF',
              border: '1px solid #C7D2FE',
              width: 'fit-content',
            }}
          >
            <CircularProgress size={14} sx={{ color: '#4F46E5' }} />
            <Typography variant="caption" sx={{ fontWeight: 650, color: '#4338CA', fontSize: '0.76rem' }}>
              {t('chat.assistant_checking')}
            </Typography>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Escalation Success Alert */}
      {escalateSuccessMsg && (
        <Box sx={{ px: { xs: 2, sm: 2.5 }, pt: 1 }}>
          <Alert severity="success" onClose={() => setEscalateSuccessMsg('')} sx={{ fontSize: '0.8rem', py: 0.2 }}>
            {escalateSuccessMsg}
          </Alert>
        </Box>
      )}

      {/* Suggested Quick Questions (Client Mode) */}
      {mode === 'client' && canInteract && (
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
              disabled={sending || checkingProposal || escalating}
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
          disabled={!canInteract || sending || checkingProposal || escalating}
          inputProps={{ maxLength: 500 }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#FFFFFF',
              borderRadius: 2,
              fontSize: '0.88rem',
            },
          }}
        />

        {/* Small always-available Escalate button when user has typed in the input box */}
        {mode === 'client' && canInteract && inputText.trim() && (
          <Button
            id="btn_escalate_input"
            type="button"
            variant="outlined"
            size="small"
            disabled={escalating}
            onClick={() => handleEscalate({ questionText: inputText.trim() })}
            startIcon={<SupportAgentOutlinedIcon sx={{ fontSize: 15 }} />}
            sx={{
              height: 40,
              minHeight: 40,
              textTransform: 'none',
              fontWeight: 650,
              fontSize: '0.74rem',
              borderRadius: 2,
              color: '#B45309',
              borderColor: '#FCD34D',
              bgcolor: '#FFFBEB',
              '&:hover': { bgcolor: '#FEF3C7', borderColor: '#F59E0B' },
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {t('chat.btn_escalate', { adviserName: advisorName, advisorName, firmName })}
          </Button>
        )}

        <Button
          id="mandate_chat_send_btn"
          type="submit"
          variant="contained"
          disabled={!canInteract || sending || checkingProposal || escalating || !inputText.trim()}
          startIcon={sending || checkingProposal ? <CircularProgress size={16} color="inherit" /> : <SendIcon sx={{ fontSize: 16 }} />}
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
          {sending || checkingProposal ? t('chat.btn_sending_short') : t('chat.btn_send_short')}
        </Button>
      </Box>
    </Card>
  );
};

export default MandateChat;
