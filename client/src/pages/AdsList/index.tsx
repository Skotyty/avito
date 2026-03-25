import { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Switch,
  Button,
  Pagination,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useQuery } from '@tanstack/react-query';
import { itemsApi } from '../../api/items';
import { AdCard } from '../../components/AdCard';
import type { Category, SortColumn, SortDirection } from '../../types';
import { getCategoryLabel } from '../../utils/formatters';

const ITEMS_PER_PAGE = 10;

type SortOption = '' | 'createdAt_desc' | 'createdAt_asc' | 'title_asc' | 'title_desc' | 'price_asc' | 'price_desc';

function parseSortOption(opt: SortOption): { sortColumn?: SortColumn; sortDirection?: SortDirection } {
  if (!opt) return {};
  const idx = opt.lastIndexOf('_');
  const col = opt.slice(0, idx) as SortColumn;
  const dir = opt.slice(idx + 1) as SortDirection;
  return { sortColumn: col, sortDirection: dir };
}

export function AdsListPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [onlyNeedsRevision, setOnlyNeedsRevision] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('createdAt_desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const skip = (page - 1) * ITEMS_PER_PAGE;
  const { sortColumn, sortDirection } = parseSortOption(sortOption);
  const isPriceSort = sortColumn === 'price';

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: ({ signal }) => itemsApi.getCategories(signal),
    staleTime: 5 * 60 * 1000,
  });

  const { data: rawData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['items', debouncedSearch, selectedCategories, onlyNeedsRevision, sortOption, isPriceSort ? 'all' : page],
    queryFn: ({ signal }) =>
      itemsApi.getItems(
        {
          q: debouncedSearch || undefined,
          limit: isPriceSort ? 9999 : ITEMS_PER_PAGE,
          skip: isPriceSort ? 0 : skip,
          categories: selectedCategories.length ? selectedCategories : undefined,
          needsRevision: onlyNeedsRevision || undefined,
          sortColumn: isPriceSort ? undefined : sortColumn,
          sortDirection: isPriceSort ? undefined : sortDirection,
        },
        signal,
      ),
  });

  const data = useMemo(() => {
    if (!rawData || !isPriceSort) return rawData;
    const sorted = [...rawData.items].sort((a, b) => {
      const pa = a.price ?? 0;
      const pb = b.price ?? 0;
      return sortDirection === 'asc' ? pa - pb : pb - pa;
    });
    return {
      total: rawData.total,
      items: sorted.slice(skip, skip + ITEMS_PER_PAGE),
    };
  }, [rawData, isPriceSort, sortDirection, skip]);

  const handleCategoryToggle = useCallback((cat: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
    setPage(1);
  }, []);

  const handleReset = () => {
    setSelectedCategories([]);
    setOnlyNeedsRevision(false);
    setSortOption('createdAt_desc');
    setSearchInput('');
    setPage(1);
  };

  const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Мои объявления
        </Typography>
        {data && (
          <Typography variant="body2" color="text.secondary">
            {data.total} объявлений
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, alignItems: 'center' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Найти объявление..."
          value={searchInput}
          onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ bgcolor: 'background.paper' }}
        />

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, v) => v && setViewMode(v)}
          size="small"
          sx={{ flexShrink: 0 }}
        >
          <ToggleButton value="grid" aria-label="сетка">
            <GridViewIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="list" aria-label="список">
            <ViewListIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>

        <FormControl size="small" sx={{ minWidth: 220, flexShrink: 0, bgcolor: 'background.paper' }}>
          <InputLabel>Сортировка</InputLabel>
          <Select
            value={sortOption}
            label="Сортировка"
            onChange={(e) => { setSortOption(e.target.value as SortOption); setPage(1); }}
          >
            <MenuItem value="createdAt_desc">По новизне (сначала новые)</MenuItem>
            <MenuItem value="createdAt_asc">По новизне (сначала старые)</MenuItem>
            <MenuItem value="title_asc">По названию А – Я</MenuItem>
            <MenuItem value="title_desc">По названию Я – А</MenuItem>
            <MenuItem value="price_asc">По цене (сначала дешевле)</MenuItem>
            <MenuItem value="price_desc">По цене (сначала дороже)</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        <Paper
          variant="outlined"
          sx={{
            width: 230,
            flexShrink: 0,
            p: 2,
            borderRadius: 2,
            position: 'sticky',
            top: 16,
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Фильтры
          </Typography>

          <Divider sx={{ mb: 1.5 }} />

          <Typography variant="body2" fontWeight={600} gutterBottom>
            Категория
          </Typography>
          <FormGroup>
            {categories.map((cat) => (
              <FormControlLabel
                key={cat}
                control={
                  <Checkbox
                    size="small"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => handleCategoryToggle(cat)}
                  />
                }
                label={<Typography variant="body2">{getCategoryLabel(cat)}</Typography>}
                sx={{ mb: 0 }}
              />
            ))}
          </FormGroup>

          <Divider sx={{ my: 1.5 }} />

          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={onlyNeedsRevision}
                onChange={(e) => { setOnlyNeedsRevision(e.target.checked); setPage(1); }}
              />
            }
            label={
              <Typography variant="body2" fontWeight={600}>
                Только требующие доработок
              </Typography>
            }
            sx={{ alignItems: 'flex-start', ml: 0 }}
          />

          <Button
            variant="text"
            color="inherit"
            size="small"
            onClick={handleReset}
            sx={{ mt: 1.5, color: 'text.secondary', fontSize: '0.75rem', p: 0, minWidth: 0 }}
          >
            Сбросить фильтры
          </Button>
        </Paper>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : isError ? (
            <Alert
              severity="error"
              action={
                <Button size="small" color="inherit" onClick={() => void refetch()}>
                  Повторить
                </Button>
              }
            >
              {(error as Error).message || 'Не удалось загрузить объявления'}
            </Alert>
          ) : data?.items.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <SearchIcon sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
              <Typography color="text.secondary">Объявления не найдены</Typography>
              <Button variant="text" size="small" sx={{ mt: 1 }} onClick={handleReset}>
                Сбросить фильтры
              </Button>
            </Box>
          ) : viewMode === 'grid' ? (
            <Grid container spacing={2}>
              {data?.items.map((item) => (
                <Grid item key={item.id} xs={12} sm={6} md={4} lg={2.4}>
                  <AdCard item={item} viewMode="grid" />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {data?.items.map((item) => (
                <AdCard key={item.id} item={item} viewMode="list" />
              ))}
            </Box>
          )}

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, p) => setPage(p)}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
}
