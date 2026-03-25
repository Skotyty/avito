import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  IconButton,
  Popover,

  InputAdornment,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from '@mui/icons-material/Clear';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { itemsApi } from '../../api/items';
import { llmApi, getLlmErrorMessage } from '../../api/llm';
import { DiffViewer } from '../../components/DiffViewer';
import { AiChat } from '../../components/AiChat';
import { useDraftStorage } from '../../hooks/useLocalStorage';
import type { Category, AutoItemParams, RealEstateItemParams, ElectronicsItemParams, ItemUpdatePayload } from '../../types';

interface FormValues {
  category: Category;
  title: string;
  description: string;
  price: string;
  params: AutoItemParams | RealEstateItemParams | ElectronicsItemParams;
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
      {children}
      {required && <span style={{ color: '#d32f2f', marginLeft: 2 }}>*</span>}
    </Typography>
  );
}

function warningIfEmpty(isEmpty: boolean): object {
  if (!isEmpty) return {};
  return {
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'warning.main' },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'warning.dark',
    },
  };
}

function AutoFields({ params, onChange }: { params: AutoItemParams; onChange: (p: AutoItemParams) => void }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <FieldLabel required>Тип</FieldLabel>
        <FormControl fullWidth size="small">
          <Select
            displayEmpty
            value={params.transmission ?? ''}
            onChange={(e) => onChange({ ...params, transmission: (e.target.value as 'automatic' | 'manual') || undefined })}
          >
            <MenuItem value="" disabled><em>Не выбрано</em></MenuItem>
            <MenuItem value="automatic">Автомат</MenuItem>
            <MenuItem value="manual">Механика</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <FieldLabel>Марка</FieldLabel>
          <TextField fullWidth size="small" value={params.brand ?? ''} onChange={(e) => onChange({ ...params, brand: e.target.value || undefined })} sx={warningIfEmpty(!params.brand)} />
        </Grid>
        <Grid item xs={6}>
          <FieldLabel>Модель</FieldLabel>
          <TextField fullWidth size="small" value={params.model ?? ''} onChange={(e) => onChange({ ...params, model: e.target.value || undefined })} sx={warningIfEmpty(!params.model)} />
        </Grid>
        <Grid item xs={6}>
          <FieldLabel>Год выпуска</FieldLabel>
          <TextField fullWidth size="small" type="number" value={params.yearOfManufacture ?? ''} onChange={(e) => onChange({ ...params, yearOfManufacture: e.target.value ? Number(e.target.value) : undefined })} inputProps={{ min: 1900, max: new Date().getFullYear() }} sx={warningIfEmpty(!params.yearOfManufacture)} />
        </Grid>
        <Grid item xs={6}>
          <FieldLabel>Пробег (км)</FieldLabel>
          <TextField fullWidth size="small" type="number" value={params.mileage ?? ''} onChange={(e) => onChange({ ...params, mileage: e.target.value ? Number(e.target.value) : undefined })} inputProps={{ min: 0 }} sx={warningIfEmpty(!params.mileage)} />
        </Grid>
        <Grid item xs={12}>
          <FieldLabel>Мощность двигателя (л.с.)</FieldLabel>
          <TextField fullWidth size="small" type="number" value={params.enginePower ?? ''} onChange={(e) => onChange({ ...params, enginePower: e.target.value ? Number(e.target.value) : undefined })} inputProps={{ min: 0 }} sx={warningIfEmpty(!params.enginePower)} />
        </Grid>
      </Grid>
    </Box>
  );
}

function RealEstateFields({ params, onChange }: { params: RealEstateItemParams; onChange: (p: RealEstateItemParams) => void }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <FieldLabel>Тип недвижимости</FieldLabel>
        <FormControl fullWidth size="small" sx={warningIfEmpty(!params.type)}>
          <Select displayEmpty value={params.type ?? ''} onChange={(e) => onChange({ ...params, type: (e.target.value as 'flat' | 'house' | 'room') || undefined })}>
            <MenuItem value="" disabled><em>Не выбрано</em></MenuItem>
            <MenuItem value="flat">Квартира</MenuItem>
            <MenuItem value="house">Дом</MenuItem>
            <MenuItem value="room">Комната</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box>
        <FieldLabel>Адрес</FieldLabel>
        <TextField fullWidth size="small" value={params.address ?? ''} onChange={(e) => onChange({ ...params, address: e.target.value || undefined })} sx={warningIfEmpty(!params.address)} />
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <FieldLabel>Площадь (м²)</FieldLabel>
          <TextField fullWidth size="small" type="number" value={params.area ?? ''} onChange={(e) => onChange({ ...params, area: e.target.value ? Number(e.target.value) : undefined })} inputProps={{ min: 0, step: 0.1 }} sx={warningIfEmpty(!params.area)} />
        </Grid>
        <Grid item xs={6}>
          <FieldLabel>Этаж</FieldLabel>
          <TextField fullWidth size="small" type="number" value={params.floor ?? ''} onChange={(e) => onChange({ ...params, floor: e.target.value ? Number(e.target.value) : undefined })} inputProps={{ min: 1 }} sx={warningIfEmpty(!params.floor)} />
        </Grid>
      </Grid>
    </Box>
  );
}

function ElectronicsFields({ params, onChange }: { params: ElectronicsItemParams; onChange: (p: ElectronicsItemParams) => void }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <FieldLabel required>Тип</FieldLabel>
        <FormControl fullWidth size="small">
          <Select displayEmpty value={params.type ?? ''} onChange={(e) => onChange({ ...params, type: (e.target.value as 'phone' | 'laptop' | 'misc') || undefined })}>
            <MenuItem value="" disabled><em>Не выбрано</em></MenuItem>
            <MenuItem value="phone">Телефон</MenuItem>
            <MenuItem value="laptop">Ноутбук</MenuItem>
            <MenuItem value="misc">Другое</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box>
        <FieldLabel>Бренд</FieldLabel>
        <TextField fullWidth size="small" value={params.brand ?? ''} onChange={(e) => onChange({ ...params, brand: e.target.value || undefined })} sx={warningIfEmpty(!params.brand)} />
      </Box>
      <Box>
        <FieldLabel>Модель</FieldLabel>
        <TextField fullWidth size="small" value={params.model ?? ''} onChange={(e) => onChange({ ...params, model: e.target.value || undefined })} sx={warningIfEmpty(!params.model)} />
      </Box>
      <Box>
        <FieldLabel>Цвет</FieldLabel>
        <TextField fullWidth size="small" value={params.color ?? ''} onChange={(e) => onChange({ ...params, color: e.target.value || undefined })} sx={warningIfEmpty(!params.color)} />
      </Box>
      <Box>
        <FieldLabel>Состояние</FieldLabel>
        <FormControl fullWidth size="small" sx={warningIfEmpty(!params.condition)}>
          <Select displayEmpty value={params.condition ?? ''} onChange={(e) => onChange({ ...params, condition: (e.target.value as 'new' | 'used') || undefined })}>
            <MenuItem value="" disabled><em>Не выбрано</em></MenuItem>
            <MenuItem value="new">Новый</MenuItem>
            <MenuItem value="used">Б/У</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}

interface AiCardProps {
  title: string;
  content: string;
  onApply?: () => void;
  onClose: () => void;
  onRetry: () => void;
  isLoading?: boolean;
  error?: string;
}

function AiSuggestCard({ content, onApply, onClose, onRetry, isLoading, error }: AiCardProps) {
  return (
    <Paper
      elevation={2}
      sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" fontWeight={700}>
          {error ? 'Произошла ошибка при запросе к AI' : 'Ответ AI:'}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      {isLoading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
          <CircularProgress size={16} />
          <Typography variant="body2" color="text.secondary">Генерирую...</Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>{error}</Typography>
          <Typography variant="body2" color="text.secondary">
            Попробуйте повторить запрос или закройте уведомление
          </Typography>
        </Alert>
      ) : (
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 1.5, lineHeight: 1.6 }}>
          {content}
        </Typography>
      )}
      {!isLoading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!error && onApply && (
              <Button variant="contained" size="small" onClick={onApply} sx={{ flex: 1 }}>
                Применить
              </Button>
            )}
            <Button variant="outlined" size="small" onClick={onClose} sx={{ flex: 1 }}>
              Закрыть
            </Button>
          </Box>
          <Button
            variant="text"
            size="small"
            color="warning"
            startIcon={<RefreshIcon fontSize="small" />}
            onClick={onRetry}
            fullWidth
          >
            Повторить запрос
          </Button>
        </Box>
      )}
    </Paper>
  );
}

const CHAT_DRAWER_WIDTH = 480;

export function AdEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const itemId = Number(id);

  const [form, setForm] = useState<FormValues | null>(null);
  const [errors, setErrors] = useState<Partial<Record<'title' | 'price', string>>>({});
  const [touched, setTouched] = useState<Partial<Record<'title' | 'price', boolean>>>({});

  const [aiDescription, setAiDescription] = useState('');
  const [aiPrice, setAiPrice] = useState('');
  const [aiDescError, setAiDescError] = useState('');
  const [aiPriceError, setAiPriceError] = useState('');
  const [isGenDesc, setIsGenDesc] = useState(false);
  const [isGenPrice, setIsGenPrice] = useState(false);
  const [showDescCard, setShowDescCard] = useState(false);
  const [showPriceCard, setShowPriceCard] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [showChat, setShowChat] = useState(() => {
    try {
      const stored = window.localStorage.getItem(`avito-chat-${itemId}`);
      if (stored) {
        const parsed = JSON.parse(stored) as unknown[];
        return Array.isArray(parsed) && parsed.length > 0;
      }
    } catch {}
    return false;
  });

  const aiDescAbortRef = useRef<AbortController | null>(null);
  const aiPriceAbortRef = useRef<AbortController | null>(null);
  const pricePopoverAnchor = useRef<HTMLButtonElement | null>(null);
  const descPopoverAnchor = useRef<HTMLButtonElement | null>(null);

  const { draft, setDraft, clearDraft } = useDraftStorage<FormValues>(itemId, {} as FormValues);
  const [draftRestored, setDraftRestored] = useState(false);

  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Сохраняем черновик не чаще раза в 500 мс
  const saveDraftDebounced = useCallback((data: FormValues) => {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => setDraft(data), 500);
  }, [setDraft]);

  const { data: item, isLoading, isError, error } = useQuery({
    queryKey: ['item', itemId],
    queryFn: ({ signal }) => itemsApi.getItem(itemId, signal),
    enabled: !isNaN(itemId),
  });

  useEffect(() => {
    if (!item || draftRestored) return;

    if (draft && Object.keys(draft).length > 0) {
      setForm(draft as FormValues);
      enqueueSnackbar('Черновик восстановлен', { variant: 'info' });
    } else {
      setForm({
        category: item.category,
        title: item.title,
        description: item.description ?? '',
        price: item.price !== null ? String(item.price) : '',
        params: { ...item.params },
      });
    }
    setDraftRestored(true);
  }, [item, draft, draftRestored, enqueueSnackbar]);

  useEffect(() => {
    if (form && draftRestored) saveDraftDebounced(form);
  }, [form, draftRestored, saveDraftDebounced]);

  const updateMutation = useMutation({
    mutationFn: (signal?: AbortSignal) => {
      if (!form) throw new Error('Form is empty');
      const payload: ItemUpdatePayload = {
        category: form.category,
        title: form.title,
        description: form.description || undefined,
        price: Number(form.price),
        params: form.params,
      };
      return itemsApi.updateItem(itemId, payload, signal);
    },
    onSuccess: () => {
      clearDraft();
      queryClient.invalidateQueries({ queryKey: ['item', itemId] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      enqueueSnackbar('Объявление сохранено', { variant: 'success' });
      navigate(`/ads/${itemId}`);
    },
    onError: (err: Error) => {
      enqueueSnackbar(err.message || 'Ошибка сохранения', { variant: 'error' });
    },
  });

  const TITLE_MAX = 47;
  const PRICE_MAX = 1_000_000_000;

  const validateField = (field: 'title' | 'price', value: string): string => {
    if (field === 'title') {
      if (!value.trim()) return 'Обязательное поле';
      if (value.length > TITLE_MAX) return `Не более ${TITLE_MAX} символов`;
      return '';
    }
    if (field === 'price') {
      const num = Number(value);
      if (value === '' || num < 0) return 'Укажите корректную цену';
      if (num > PRICE_MAX) return `Максимальная цена — ${PRICE_MAX.toLocaleString('ru')} ₽`;
      return '';
    }
    return '';
  };

  const isFormValid = form
    ? form.title.trim() !== '' &&
      form.title.length <= TITLE_MAX &&
      form.price !== '' &&
      Number(form.price) >= 0 &&
      Number(form.price) <= PRICE_MAX
    : false;

  const handleBlur = (field: 'title' | 'price') => {
    if (!form) return;
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, form[field]) }));
  };

  const validate = () => {
    if (!form) return false;
    const titleErr = validateField('title', form.title);
    const priceErr = validateField('price', form.price);
    setErrors({ title: titleErr, price: priceErr });
    setTouched({ title: true, price: true });
    return !titleErr && !priceErr;
  };

  const handleSave = () => {
    if (!validate()) return;
    updateMutation.mutate(undefined);
  };

  const handleCancel = () => { clearDraft(); navigate(`/ads/${itemId}`); };

  const buildCurrentItem = () => ({
    ...item!,
    title: form!.title,
    description: form!.description || undefined,
    price: Number(form!.price) || item!.price,
    params: form!.params,
  });

  const handleGenerateDescription = async () => {
    if (!item || !form) return;
    aiDescAbortRef.current?.abort();
    aiDescAbortRef.current = new AbortController();
    setIsGenDesc(true);
    setShowDescCard(true);
    setShowDiff(false);
    setAiDescError('');
    try {
      const result = await llmApi.generateDescription(
        buildCurrentItem() as typeof item,
        aiDescAbortRef.current.signal,
      );
      setAiDescription(result);
    } catch (err: unknown) {
      const msg = getLlmErrorMessage(err);
      if (msg) setAiDescError(msg);
    } finally {
      setIsGenDesc(false);
    }
  };

  const parsePriceFromText = (text: string): number | null => {
    const rubleMatch = text.match(/([\d\s\u00a0]+)\s*₽/);
    if (rubleMatch) {
      const n = parseInt(rubleMatch[1].replace(/\D/g, ''), 10);
      if (!isNaN(n) && n > 0) return n;
    }
    const allNums = [...text.matchAll(/\d[\d\s\u00a0]*/g)];
    for (const m of allNums) {
      const n = parseInt(m[0].replace(/\D/g, ''), 10);
      if (n >= 1000) return n;
    }
    return null;
  };

  const handleSuggestPrice = async () => {
    if (!item || !form) return;
    aiPriceAbortRef.current?.abort();
    aiPriceAbortRef.current = new AbortController();
    setIsGenPrice(true);
    setShowPriceCard(true);
    setAiPriceError('');
    try {
      const result = await llmApi.suggestPrice(
        buildCurrentItem() as typeof item,
        aiPriceAbortRef.current.signal,
      );
      setAiPrice(result);
    } catch (err: unknown) {
      const msg = getLlmErrorMessage(err);
      if (msg) setAiPriceError(msg);
    } finally {
      setIsGenPrice(false);
    }
  };

  if (isLoading || !form) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {(error as Error)?.message || 'Объявление не найдено'}
        </Alert>
        <Button component={Link} to="/ads" startIcon={<ArrowBackIcon />} variant="text">
          К списку объявлений
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Typography variant="h5" fontWeight={700}>
          Редактирование объявления
        </Typography>
        <Button
          variant={showChat ? 'contained' : 'outlined'}
          size="small"
          startIcon={<SmartToyOutlinedIcon fontSize="small" />}
          onClick={() => setShowChat((v) => !v)}
        >
          {showChat ? 'Скрыть AI-чат' : 'AI-чат'}
        </Button>
      </Box>

      <Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <FieldLabel required>Категория</FieldLabel>
          <FormControl fullWidth size="small">
            <Select
              value={form.category}
              onChange={(e) => {
                const newCategory = e.target.value as Category;
                setForm((p) => p ? { ...p, category: newCategory, params: {} } : p);
              }}
            >
              <MenuItem value="auto">Авто</MenuItem>
              <MenuItem value="real_estate">Недвижимость</MenuItem>
              <MenuItem value="electronics">Электроника</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box>
          <FieldLabel required>Название</FieldLabel>
          <TextField
            fullWidth
            size="small"
            value={form.title}
            onChange={(e) => {
              const val = e.target.value;
              setForm((p) => p ? { ...p, title: val } : p);
              if (touched.title) setErrors((prev) => ({ ...prev, title: validateField('title', val) }));
            }}
            onBlur={() => handleBlur('title')}
            error={!!errors.title}
            helperText={
              <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{errors.title ?? ''}</span>
                <span>{form.title.length} / {TITLE_MAX}</span>
              </Box>
            }
            inputProps={{ maxLength: TITLE_MAX }}
            InputProps={{
              endAdornment: form.title ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    edge="end"
                    onClick={() => {
                      setForm((p) => p ? { ...p, title: '' } : p);
                      if (touched.title) setErrors((prev) => ({ ...prev, title: 'Обязательное поле' }));
                    }}
                    tabIndex={-1}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{ position: 'relative' }}
            FormHelperTextProps={{ sx: { position: 'absolute', top: '100%', left: 0, right: 0, m: 0, mt: '3px' } }}
          />
        </Box>

        <Box>
          <FieldLabel required>Цена</FieldLabel>
          <TextField
            fullWidth
            size="small"
            type="number"
            value={form.price}
            onChange={(e) => {
              const val = e.target.value;
              setForm((p) => p ? { ...p, price: val } : p);
              if (touched.price) setErrors((prev) => ({ ...prev, price: validateField('price', val) }));
            }}
            onBlur={() => handleBlur('price')}
            error={!!errors.price}
            helperText={errors.price}
            inputProps={{ min: 0, max: PRICE_MAX }}
            InputProps={{
              endAdornment: form.price ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    edge="end"
                    onClick={() => {
                      setForm((p) => p ? { ...p, price: '' } : p);
                      if (touched.price) setErrors((prev) => ({ ...prev, price: 'Укажите корректную цену' }));
                    }}
                    tabIndex={-1}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
          <Button
            ref={pricePopoverAnchor}
            variant="text"
            size="small"
            color="warning"
            startIcon={isGenPrice ? <CircularProgress size={14} /> : <LightbulbOutlinedIcon fontSize="small" />}
            onClick={() => void handleSuggestPrice()}
            disabled={isGenPrice}
            sx={{ mt: 0.5, p: 0, fontSize: '0.8rem' }}
          >
            Узнать рыночную цену
          </Button>
          <Popover
            open={showPriceCard}
            anchorEl={pricePopoverAnchor.current}
            onClose={() => setShowPriceCard(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            slotProps={{ paper: { sx: { width: 360, mt: 1 } } }}
          >
            <AiSuggestCard
              title="Рыночная цена"
              content={aiPrice}
              onApply={() => {
                const parsed = parsePriceFromText(aiPrice);
                if (parsed !== null) {
                  setForm((p) => p ? { ...p, price: String(parsed) } : p);
                  setShowPriceCard(false);
                  setAiPriceError('');
                  enqueueSnackbar('Цена применена', { variant: 'success' });
                } else {
                  enqueueSnackbar('Не удалось распознать числовое значение цены', { variant: 'warning' });
                }
              }}
              onClose={() => { setShowPriceCard(false); setAiPriceError(''); }}
              onRetry={() => void handleSuggestPrice()}
              isLoading={isGenPrice}
              error={aiPriceError}
            />
          </Popover>
        </Box>

        <Box>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
            Характеристики
          </Typography>
          {form.category === 'auto' && (
            <AutoFields
              params={form.params as AutoItemParams}
              onChange={(p) => setForm((prev) => prev ? { ...prev, params: p } : prev)}
            />
          )}
          {form.category === 'real_estate' && (
            <RealEstateFields
              params={form.params as RealEstateItemParams}
              onChange={(p) => setForm((prev) => prev ? { ...prev, params: p } : prev)}
            />
          )}
          {form.category === 'electronics' && (
            <ElectronicsFields
              params={form.params as ElectronicsItemParams}
              onChange={(p) => setForm((prev) => prev ? { ...prev, params: p } : prev)}
            />
          )}
        </Box>

        <Box>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Описание
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={5}
            value={form.description}
            onChange={(e) => setForm((p) => p ? { ...p, description: e.target.value } : p)}
            inputProps={{ maxLength: 2000 }}
            sx={warningIfEmpty(!form.description)}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
            <Button
              ref={descPopoverAnchor}
              variant="text"
              size="small"
              color="warning"
              startIcon={isGenDesc ? <CircularProgress size={14} /> : <LightbulbOutlinedIcon fontSize="small" />}
              onClick={() => void handleGenerateDescription()}
              disabled={isGenDesc}
              sx={{ p: 0, fontSize: '0.8rem' }}
            >
              {form.description ? 'Улучшить описание' : 'Придумать описание'}
            </Button>
            <Typography variant="caption" color="text.secondary">
              {form.description.length} / 2000
            </Typography>
          </Box>
          <Popover
            open={showDescCard}
            anchorEl={descPopoverAnchor.current}
            onClose={() => { setShowDescCard(false); setShowDiff(false); setAiDescError(''); }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            slotProps={{ paper: { sx: { width: 420, mt: 1 } } }}
          >
            <Box sx={{ p: 0 }}>
              {!aiDescError && aiDescription && form.description && (
                <Box sx={{ px: 2, pt: 2 }}>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => setShowDiff((v) => !v)}
                    sx={{ fontSize: '0.75rem', p: 0, mb: 1 }}
                  >
                    {showDiff ? 'Скрыть сравнение' : 'Показать сравнение «Было → Стало»'}
                  </Button>
                  {showDiff && <DiffViewer original={form.description} improved={aiDescription} />}
                </Box>
              )}
              <AiSuggestCard
                title="AI-описание"
                content={aiDescription}
                onApply={() => {
                  setForm((p) => p ? { ...p, description: aiDescription } : p);
                  setShowDescCard(false);
                  setShowDiff(false);
                  setAiDescError('');
                  enqueueSnackbar('Описание применено', { variant: 'success' });
                }}
                onClose={() => { setShowDescCard(false); setShowDiff(false); setAiDescError(''); }}
                onRetry={() => void handleGenerateDescription()}
                isLoading={isGenDesc}
                error={aiDescError}
              />
            </Box>
          </Popover>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="contained"
            startIcon={updateMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon />}
            onClick={handleSave}
            disabled={updateMutation.isPending || !isFormValid}
          >
            Сохранить
          </Button>
          <Button variant="outlined" color="inherit" onClick={handleCancel} sx={{ color: 'text.secondary' }}>
            Отменить
          </Button>
          </Box>
        </Box>
      </Box>

      {showChat && item && (
        <Box
          sx={{
            position: 'fixed',
            top: 520,
            left: '80%',
            transform: 'translateX(-50%)',
            width: CHAT_DRAWER_WIDTH,
            zIndex: 1300,
            boxShadow: 8,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <AiChat
            item={item}
            layout="panel"
            onClose={() => setShowChat(false)}
          />
        </Box>
      )}
    </Container>
  );
}
