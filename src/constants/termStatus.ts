export const TERM_STATUS = {
  PENDING: 'Bekleniyor',
  ARRIVED: 'Geldi',
} as const;

export type TermStatus = (typeof TERM_STATUS)[keyof typeof TERM_STATUS];
