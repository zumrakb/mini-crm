import type { Activity } from '../constants/activity.types';
import type { Customer } from '../constants/customer.types';
import type { Term } from '../constants/term.types';

export const BACKUP_VERSION = 1 as const;

export interface BackupPayload {
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  customers: Customer[];
  activities: Activity[];
  terms: Term[];
}

export async function exportBackup(): Promise<void> {
  throw new Error('Backup export is not implemented yet.');
}

export async function importBackup(_payload: BackupPayload): Promise<void> {
  throw new Error('Backup import is not implemented yet.');
}
