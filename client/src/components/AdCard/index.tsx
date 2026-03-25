import {
  Card,
  CardContent,
  CardActionArea,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { useNavigate } from 'react-router-dom';
import type { ItemListEntry } from '../../types';
import { formatPrice, getCategoryLabel } from '../../utils/formatters';

interface AdCardProps {
  item: ItemListEntry;
  viewMode?: 'grid' | 'list';
}

function ImagePlaceholder({ height }: { height: number | string }) {
  const iconSize = typeof height === 'number' ? height * 0.35 : 40;
  return (
    <Box
      sx={{
        width: '100%',
        height: height || '100%',
        bgcolor: 'grey.100',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <ImageOutlinedIcon sx={{ fontSize: iconSize, color: 'grey.400' }} />
    </Box>
  );
}

export function AdCard({ item, viewMode = 'grid' }: AdCardProps) {
  const navigate = useNavigate();

  if (viewMode === 'list') {
    return (
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardActionArea onClick={() => navigate(`/ads/${item.id}`)}>
          <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
            <Box sx={{ width: 120, flexShrink: 0, alignSelf: 'stretch', display: 'flex' }}>
              <ImagePlaceholder height="100%" />
            </Box>
            <CardContent sx={{ flex: 1, py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="caption" color="text.secondary" display="block">
                {getCategoryLabel(item.category)}
              </Typography>
              <Typography variant="subtitle2" fontWeight={600} noWrap>
                {item.title}
              </Typography>
              <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                {formatPrice(item.price)}
              </Typography>
              {item.needsRevision && (
                <Chip
                  label="● Требует доработок"
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 22, mt: 0.5 }}
                />
              )}
            </CardContent>
          </Box>
        </CardActionArea>
      </Card>
    );
  }

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: 3 },
      }}
    >
      <CardActionArea
        onClick={() => navigate(`/ads/${item.id}`)}
        sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <ImagePlaceholder height={160} />
        <CardContent sx={{ flex: 1, pt: 1.5 }}>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            {getCategoryLabel(item.category)}
          </Typography>
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{ mb: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'break-word' }}
          >
            {item.title}
          </Typography>
          <Typography variant="subtitle1" fontWeight={700}>
            {formatPrice(item.price)}
          </Typography>
          {item.needsRevision && (
            <Chip
              label="● Требует доработок"
              size="small"
              color="warning"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 22, mt: 1 }}
            />
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
