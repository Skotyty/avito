import { Alert, AlertTitle, Typography, List, ListItem } from '@mui/material';
import type { Item } from '../../types';

interface NeedsRevisionAlertProps {
  item: Item;
}

function getMissingFields(item: Item): string[] {
  const missing: string[] = [];

  if (!item.description) missing.push('Описание');

  if (item.category === 'auto') {
    const p = item.params;
    if (!p.brand) missing.push('Марка');
    if (!p.model) missing.push('Модель');
    if (!p.yearOfManufacture) missing.push('Год выпуска');
    if (!p.transmission) missing.push('Тип КПП');
    if (!p.mileage) missing.push('Пробег');
    if (!p.enginePower) missing.push('Мощность двигателя');
  } else if (item.category === 'real_estate') {
    const p = item.params;
    if (!p.type) missing.push('Тип недвижимости');
    if (!p.address) missing.push('Адрес');
    if (!p.area) missing.push('Площадь');
    if (!p.floor) missing.push('Этаж');
  } else if (item.category === 'electronics') {
    const p = item.params;
    if (!p.type) missing.push('Тип устройства');
    if (!p.brand) missing.push('Бренд');
    if (!p.model) missing.push('Модель');
    if (!p.condition) missing.push('Состояние');
    if (!p.color) missing.push('Цвет');
  }

  return missing;
}

export function NeedsRevisionAlert({ item }: NeedsRevisionAlertProps) {
  const missing = getMissingFields(item);

  if (missing.length === 0) return null;

  return (
    <Alert severity="warning" sx={{ borderRadius: 2 }}>
      <AlertTitle sx={{ fontWeight: 600 }}>Требуются доработки</AlertTitle>
      <Typography variant="body2" gutterBottom>
        У объявления не заполнены поля:
      </Typography>
      <List dense disablePadding sx={{ listStyleType: 'disc', pl: 2 }}>
        {missing.map((field) => (
          <ListItem key={field} sx={{ display: 'list-item', p: 0 }}>
            <Typography variant="body2">{field}</Typography>
          </ListItem>
        ))}
      </List>
    </Alert>
  );
}
