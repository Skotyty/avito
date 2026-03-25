import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  Divider,
  Avatar,
  Button,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from 'notistack';
import type { Item, ChatMessage } from '../../types';
import { llmApi, getLlmErrorMessage } from '../../api/llm';
import { useChatStorage } from '../../hooks/useLocalStorage';

interface AiChatProps {
  item: Item;
  layout?: 'inline' | 'panel';
  onClose?: () => void;
}

export function AiChat({ item, layout = 'inline', onClose }: AiChatProps) {
  const isPanel = layout === 'panel';
  const { enqueueSnackbar } = useSnackbar();
  const { messages: storedMessages, setMessages: saveMessages, clearMessages } = useChatStorage(item.id);
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    storedMessages.map((m) => ({ ...m, role: m.role as 'user' | 'assistant', timestamp: new Date(m.timestamp) }))
  );
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const prevMsgCountRef = useRef(messages.length);

  useEffect(() => {
    const prev = prevMsgCountRef.current;
    prevMsgCountRef.current = messages.length;
    if (messages.length > prev && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    saveMessages(messages.map((m) => ({ ...m, timestamp: m.timestamp.toISOString() })));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => () => { abortRef.current?.abort(); }, []);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    abortRef.current = new AbortController();

    try {
      const response = await llmApi.chat(item, messages, text, abortRef.current.signal);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: response, timestamp: new Date() },
      ]);
    } catch (err: unknown) {
      const msg = getLlmErrorMessage(err);
      if (msg) enqueueSnackbar(msg, { variant: 'error', style: { whiteSpace: 'pre-line' } });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: isPanel ? 0 : 2,
        height: isPanel ? '100%' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        ...(isPanel && { border: 'none', boxShadow: 'none', bgcolor: 'background.paper' }),
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        <SmartToyOutlinedIcon color="primary" fontSize="medium" />
        <Box sx={{ flex: 1, lineHeight: 1 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>
            AI-ассистент
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
            Помощь в создании объявлений
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {messages.length > 0 && (
            <Button
              size="small"
              color="inherit"
              startIcon={<DeleteOutlineIcon fontSize="small" />}
              onClick={() => { setMessages([]); clearMessages(); }}
              sx={{ fontSize: '0.72rem', color: 'text.secondary', minWidth: 0 }}
            >
              Очистить
            </Button>
          )}
          {onClose && (
          <IconButton size="small" edge="end" onClick={onClose} aria-label="Закрыть чат">
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
        </Box>
      </Box>

      <Box
        ref={scrollRef}
        sx={{
          height: isPanel ? 520 : 280,
          overflowY: 'auto',
          p: 2,
        }}
      >
        {messages.length === 0 ? (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Задайте вопрос об объявлении.
              <br />
              Контекст карточки передаётся автоматически.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  gap: 1,
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                }}
              >
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: msg.role === 'user' ? 'primary.main' : 'grey.200',
                    flexShrink: 0,
                  }}
                >
                  {msg.role === 'user' ? (
                    <PersonOutlineIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <SmartToyOutlinedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                  )}
                </Avatar>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    maxWidth: '80%',
                    bgcolor: msg.role === 'user' ? 'primary.main' : 'grey.100',
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: 'pre-wrap', color: msg.role === 'user' ? 'white' : 'text.primary' }}
                  >
                    {msg.content}
                  </Typography>
                </Paper>
              </Box>
            ))}
            {isLoading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="caption" color="text.secondary">AI думает...</Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>

      <Divider sx={{ flexShrink: 0 }} />
      <Box sx={{ p: 1.5, display: 'flex', gap: 1, flexShrink: 0 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Напишите вопрос..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); } }}
          disabled={isLoading}
        />
        <IconButton
          color="primary"
          onClick={() => void handleSend()}
          disabled={!inputValue.trim() || isLoading}
          size="small"
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
}
