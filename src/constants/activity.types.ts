import type { ActivityType } from '../constants/activityTypes';

export interface Activity {
  id: number;
  customerId: number;
  date: string;
  type: ActivityType;
  note: string | null;
  relatedTermId: number | null;
  createdAt: string;
}
