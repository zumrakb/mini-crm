export const TERM_STATUS = {
  ORDERED: 'Sipariş edildi',
  PENDING: 'Bekleniyor',
  ARRIVED: 'Geldi',
} as const;

export type TermStatus = (typeof TERM_STATUS)[keyof typeof TERM_STATUS];

export function getTermStatusTranslationKey(status: TermStatus): string {
  switch (status) {
    case TERM_STATUS.ORDERED:
      return 'termStatus.ordered';
    case TERM_STATUS.PENDING:
      return 'termStatus.pending';
    case TERM_STATUS.ARRIVED:
      return 'termStatus.arrived';
    default:
      return 'termStatus.pending';
  }
}

export function isPendingTermStatus(status: TermStatus): boolean {
  return status === TERM_STATUS.ORDERED || status === TERM_STATUS.PENDING;
}
