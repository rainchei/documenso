import { Currency } from '@documenso/prisma/client';

export const CURRENCY_MAP = Object.values(Currency).map((currency) => ({
  label: currency,
  value: currency,
}));
