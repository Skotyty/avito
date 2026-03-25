import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from '@mui/material';
import EditIcon from '@mui/icons-material/EditOutlined';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { itemsApi } from '../../api/items';
import { NeedsRevisionAlert } from '../../components/NeedsRevisionBadge';
import { formatPrice, formatDate } from '../../utils/formatters';
import type { AutoItemParams, RealEstateItemParams, ElectronicsItemParams } from '../../types';

function ImagePlaceholder({ height }: { height: number }) {
  return (
    <Box
      sx={{
        width: '100%',
        height,
        bgcolor: 'grey.100',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 1,
      }}
    >
      <ImageOutlinedIcon sx={{ fontSize: height * 0.3, color: 'grey.400' }} />
    </Box>
  );
}

function AutoParamsTable({ params }: { params: AutoItemParams }) {
  const rows = [
    { label: 'Тип', value: params.brand },
    { label: 'Марка', value: params.brand },
    { label: 'Модель', value: params.model },
    { label: 'Год выпуска', value: params.yearOfManufacture },
    {
      label: 'КПП',
      value: params.transmission === 'automatic' ? 'Автомат' : params.transmission === 'manual' ? 'Механика' : undefined,
    },
    { label: 'Пробег', value: params.mileage ? `${params.mileage.toLocaleString('ru-RU')} км` : undefined },
    { label: 'Мощность', value: params.enginePower ? `${params.enginePower} л.с.` : undefined },
  ].filter((r) => r.value !== undefined && r.value !== null && r.label !== 'Тип');

  return <CharTable rows={rows as { label: string; value: string | number }[]} />;
}

function RealEstateParamsTable({ params }: { params: RealEstateItemParams }) {
  const typeLabel = params.type === 'flat' ? 'Квартира' : params.type === 'house' ? 'Дом' : params.type === 'room' ? 'Комната' : undefined;
  const rows = [
    { label: 'Тип', value: typeLabel },
    { label: 'Адрес', value: params.address },
    { label: 'Площадь', value: params.area ? `${params.area} м²` : undefined },
    { label: 'Этаж', value: params.floor },
  ].filter((r) => r.value !== undefined && r.value !== null);

  return <CharTable rows={rows as { label: string; value: string | number }[]} />;
}

function ElectronicsParamsTable({ params }: { params: ElectronicsItemParams }) {
  const typeLabel =
    params.type === 'phone' ? 'Телефон' : params.type === 'laptop' ? 'Ноутбук' : params.type === 'misc' ? 'Другое' : undefined;
  const rows = [
    { label: 'Тип', value: typeLabel },
    { label: 'Бренд', value: params.brand },
    { label: 'Модель', value: params.model },
    { label: 'Состояние', value: params.condition === 'new' ? 'Новый' : params.condition === 'used' ? 'Б/у' : undefined },
    { label: 'Цвет', value: params.color },
  ].filter((r) => r.value !== undefined && r.value !== null);

  return <CharTable rows={rows as { label: string; value: string | number }[]} />;
}

function CharTable({ rows }: { rows: { label: string; value: string | number }[] }) {
  return (
    <Table size="small">
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.label} sx={{ '&:last-child td': { border: 0 } }}>
            <TableCell
              sx={{ color: 'text.secondary', border: 'none', pl: 0, width: '45%', py: 0.75 }}
            >
              {row.label}
            </TableCell>
            <TableCell sx={{ fontWeight: 500, border: 'none', py: 0.75 }}>
              {String(row.value)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function AdViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const itemId = Number(id);

  const { data: item, isLoading, isError, error } = useQuery({
    queryKey: ['item', itemId],
    queryFn: ({ signal }) => itemsApi.getItem(itemId, signal),
    enabled: !isNaN(itemId),
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !item) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {(error as Error)?.message || 'Объявление не найдено'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Button
          size="small"
          startIcon={<ArrowBackIosNewIcon sx={{ fontSize: '0.75rem !important' }} />}
          onClick={() => navigate('/')}
          sx={{ color: 'text.secondary', px: 0, minWidth: 0 }}
        >
          Назад
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom noWrap title={item.title}>
            {item.title}
          </Typography>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/ads/${item.id}/edit`)}
            size="small"
          >
            Редактировать
          </Button>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
            {formatPrice(item.price)}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Опубликовано: {formatDate(item.createdAt)}
          </Typography>
          {item.updatedAt !== item.createdAt && (
            <Typography variant="caption" color="text.secondary" display="block">
              Отредактировано: {formatDate(item.updatedAt)}
            </Typography>
          )}
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={5}>
          <ImagePlaceholder height={300} />
          <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
            {[1, 2, 3, 4].map((n) => (
              <Box
                key={n}
                sx={{
                  flex: 1,
                  height: 60,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'grey.200' },
                }}
              >
                <ImageOutlinedIcon sx={{ fontSize: 24, color: 'grey.400' }} />
              </Box>
            ))}
          </Box>
        </Grid>

        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {item.needsRevision && <NeedsRevisionAlert item={item} />}

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Характеристики
              </Typography>
              <Divider sx={{ mb: 1 }} />
              {item.category === 'auto' && <AutoParamsTable params={item.params} />}
              {item.category === 'real_estate' && <RealEstateParamsTable params={item.params} />}
              {item.category === 'electronics' && <ElectronicsParamsTable params={item.params} />}
            </Paper>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Описание
        </Typography>
        <Divider sx={{ mb: 1.5 }} />
        {item.description ? (
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
            {item.description}
          </Typography>
        ) : (
          <Typography variant="body1" color="text.disabled" fontStyle="italic">
            Отсутствует
          </Typography>
        )}
      </Box>

    </Container>
  );
}
