import type { TermStatus } from '../constants/termStatus';

export interface Term {
  id: number;
  customerId: number;
  productName: string;
  orderDate: string;
  termDuration: string;
  expectedDate: string;
  status: TermStatus;
  arrivedAt: string | null;
  createdAt: string;
}
